package com.forsetijudge.api.adapter.driving.controller

import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.DeleteAllSessionsByMemberUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [SessionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [SessionController::class])
class SessionControllerTest(
    @MockkBean(relaxed = true)
    private val deleteAllSessionsByMemberUseCase: DeleteAllSessionsByMemberUseCase,
    @MockkBean(relaxed = true)
    private val sessionCookieBuilder: SessionCookieBuilder,
    @MockkBean(relaxed = true)
    private val csrfCookieBuilder: CsrfCookieBuilder,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        beforeEach {
            every { sessionCookieBuilder.buildCleanCookie() } returns "session_id="
            every { csrfCookieBuilder.buildCleanCookie() } returns "csrf_token="
        }

        test("getCurrent") {
            val session = SessionMockBuilder.build()
            ExecutionContext.set(
                traceId = IdGenerator.getTraceId(),
                contestId = null,
                session = SessionMockBuilder.build().toResponseBodyDTO(),
            )

            webMvc
                .get("/api/v1/sessions/me")
                .andExpect {
                    status { isOk() }
                    content { session.toResponseBodyDTO() }
                }
        }

        test("deleteCurrent") {
            val session = SessionMockBuilder.build()
            ExecutionContext.set(
                traceId = IdGenerator.getTraceId(),
                contestId = null,
                session = session.toResponseBodyDTO(),
            )

            webMvc
                .delete("/api/v1/sessions/me")
                .andExpect {
                    status { isNoContent() }
                    cookie {
                        value("session_id", "")
                        value("csrf_token", "")
                    }
                }

            verify { deleteAllSessionsByMemberUseCase.execute() }
        }
    })
