package io.github.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.security.SessionAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [SesssionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [SesssionController::class])
class SessionControllerTest(
    @MockkBean(relaxed = true)
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        test("getSession") {
            val session = SessionMockBuilder.build()
            SecurityContextHolder.getContext().authentication = SessionAuthentication(session)

            webMvc
                .get("/v1/session/me")
                .andExpect {
                    status { isOk() }
                    content { session }
                }
        }
    })
