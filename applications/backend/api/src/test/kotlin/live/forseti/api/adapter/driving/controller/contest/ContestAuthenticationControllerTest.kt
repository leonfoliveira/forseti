package live.forseti.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import live.forseti.api.adapter.dto.response.session.toResponseDTO
import live.forseti.api.adapter.util.cookie.CsrfCookieBuilder
import live.forseti.api.adapter.util.cookie.SessionCookieBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.port.driving.usecase.authentication.AuthenticateUseCase
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import java.util.UUID

@WebMvcTest(controllers = [ContestAuthenticationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestAuthenticationController::class])
class ContestAuthenticationControllerTest(
    @MockkBean(relaxed = true)
    private val authenticateUseCase: AuthenticateUseCase,
    @MockkBean(relaxed = true)
    private val sessionCookieBuilder: SessionCookieBuilder,
    @MockkBean(relaxed = true)
    private val csrfCookieBuilder: CsrfCookieBuilder,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}"

        test("authenticateToContest") {
            val contestId = UUID.randomUUID()
            val body = ContestAuthenticateInputDTO(login = "user", password = "password")
            val session = SessionMockBuilder.build()
            every { authenticateUseCase.authenticateToContest(contestId, body) } returns session
            every { sessionCookieBuilder.buildCookie(session) } returns "session_id=cookie_value"
            every { csrfCookieBuilder.buildCookie(session) } returns "csrf_token=cookie_value"

            webMvc
                .post("$basePath/sign-in", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    cookie {
                        value("session_id", "cookie_value")
                        value("csrf_token", "cookie_value")
                    }
                    content { session.toResponseDTO() }
                }
        }
    })
