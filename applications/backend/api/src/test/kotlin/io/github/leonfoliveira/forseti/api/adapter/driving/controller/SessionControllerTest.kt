package io.github.leonfoliveira.forseti.api.adapter.driving.controller

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.util.SessionCookieUtil
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.service.authentication.AuthenticationService
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
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
    private val authenticationService: AuthenticationService,
    @MockkBean(relaxed = true)
    private val sessionCookieUtil: SessionCookieUtil,
    @MockkBean(relaxed = true)
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        test("getSession") {
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session

            webMvc
                .get("/v1/session/me")
                .andExpect {
                    status { isOk() }
                    content { session }
                }
        }

        test("deleteSession") {
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session

            webMvc
                .delete("/v1/session/me")
                .andExpect {
                    status { isNoContent() }
                    cookie {
                        value("session_id", "")
                        path("session_id", "/")
                        secure("session_id", true)
                        httpOnly("session_id", true)
                        sameSite("session_id", "Lax")
                    }
                }
        }

        test("deleteSession without session") {
            RequestContext.getContext().session = null
            webMvc
                .delete("/v1/session/me")
                .andExpect {
                    status { isNoContent() }
                    cookie {
                        value("session_id", "")
                        path("session_id", "/")
                        secure("session_id", true)
                        httpOnly("session_id", true)
                        sameSite("session_id", "Lax")
                    }
                }

            verify(exactly = 0) { authenticationService.deleteCurrentSession() }
        }
    })
