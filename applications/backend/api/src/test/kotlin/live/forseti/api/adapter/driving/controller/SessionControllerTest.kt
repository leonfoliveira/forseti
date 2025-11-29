package live.forseti.api.adapter.driving.controller

import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import live.forseti.api.adapter.util.cookie.SessionCookieBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.session.DeleteSessionUseCase
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
    private val deleteSessionUseCase: DeleteSessionUseCase,
    @MockkBean(relaxed = true)
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        beforeEach {
            every { sessionCookieBuilder.buildCleanCookie() } returns "session_id="
        }

        test("getSession") {
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session

            webMvc
                .get("/api/v1/session/me")
                .andExpect {
                    status { isOk() }
                    content { session }
                }
        }

        test("deleteSession") {
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session

            webMvc
                .delete("/api/v1/session/me")
                .andExpect {
                    status { isNoContent() }
                    cookie {
                        value("session_id", "")
                    }
                }
        }

        test("deleteSession without session") {
            RequestContext.getContext().session = null
            webMvc
                .delete("/api/v1/session/me")
                .andExpect {
                    status { isNoContent() }
                    cookie {
                        value("session_id", "")
                    }
                }

            verify { deleteSessionUseCase.deleteCurrent() }
        }
    })
