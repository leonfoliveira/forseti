package com.forsetijudge.api.adapter.driving.http.controller.sso

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [SSOController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [SSOController::class])
class SSOControllerTest(
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        context("getGrafanaCredentials") {
            test("root") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT, contest = null)
                val session = SessionMockBuilder.build(member = member).toResponseBodyDTO()
                ExecutionContext.start()
                ExecutionContext.setSession(session)

                webMvc
                    .get("/v1/sso/grafana")
                    .andExpect {
                        status { isOk() }
                        header { string("x-webauth-user", member.login) }
                        header { string("x-webauth-name", member.name) }
                        content { """{"ok":true}""" }
                    }
            }

            test("authorized member") {
                val member = MemberMockBuilder.build(type = Member.Type.STAFF)
                val session = SessionMockBuilder.build(member = member).toResponseBodyDTO()
                ExecutionContext.start()
                ExecutionContext.setSession(session)

                webMvc
                    .get("/v1/sso/grafana")
                    .andExpect {
                        status { isOk() }
                        header { string("x-webauth-user", "${member.login}@${member.contest!!.slug}") }
                        header { string("x-webauth-name", member.name) }
                        content { """{"ok":true}""" }
                    }
            }

            test("unauthorized member") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val session = SessionMockBuilder.build(member = member).toResponseBodyDTO()
                ExecutionContext.start()
                ExecutionContext.setSession(session)

                webMvc
                    .get("/v1/sso/grafana")
                    .andExpect {
                        status { isOk() }
                        header { doesNotExist("x-webauth-user") }
                        header { doesNotExist("x-webauth-name") }
                        content { """{"ok":false}""" }
                    }
            }
        }
    })
