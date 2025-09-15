package io.github.leonfoliveira.judge.api.controller.contest

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.dto.response.session.toResponseDTO
import io.github.leonfoliveira.judge.api.service.SessionCookieService
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.judge.common.service.authentication.AuthenticationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.ContestAuthenticateInputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
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
    private val authenticationService: AuthenticationService,
    @MockkBean(relaxed = true)
    private val sessionCookieService: SessionCookieService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val objectMapper = jacksonObjectMapper()

        val authenticateInputDTO =
            ContestAuthenticateInputDTO(
                login = "testLogin",
                password = "testPassword",
            )

        test("authenticateToContest") {
            val contestId = UUID.randomUUID()
            val session = SessionMockBuilder.build()
            val token =
                "session_id=${session.id}; Max-Age=3600; Expires=${session.expiresAt.toInstant()}; " +
                    "Path=/; HttpOnly; SameSite=Lax; Secure"
            every { authenticationService.authenticate(contestId, authenticateInputDTO) } returns session
            every { sessionCookieService.buildCookie(session) } returns token

            webMvc
                .post("/v1/contests/{contestId}/sign-in", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(authenticateInputDTO)
                }.andExpect {
                    status { isOk() }
                    cookie {
                        value("session_id", session.id.toString())
                        path("session_id", "/")
                        secure("session_id", true)
                        httpOnly("session_id", true)
                        sameSite("session_id", "Lax")
                    }
                    content { session.toResponseDTO() }
                }
        }
    })
