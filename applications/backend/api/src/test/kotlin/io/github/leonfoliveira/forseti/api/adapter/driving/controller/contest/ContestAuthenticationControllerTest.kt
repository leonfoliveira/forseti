package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.SessionCookieUtil
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.ContestAuthenticateInputDTO
import io.github.leonfoliveira.forseti.common.application.port.driving.AuthenticationUseCase
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
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
    private val authenticationUseCase: AuthenticationUseCase,
    @MockkBean(relaxed = true)
    private val sessionCookieUtil: SessionCookieUtil,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        test("authenticateToContest") {
            val contestId = UUID.randomUUID()
            val body = ContestAuthenticateInputDTO(login = "user", password = "password")
            val session = SessionMockBuilder.build()
            every { authenticationUseCase.authenticateToContest(contestId, body) } returns session
            every { sessionCookieUtil.buildCookie(session) } returns "session_id=cookie_value"

            webMvc
                .post("/v1/contests/{contestId}/sign-in", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    cookie {
                        value("session_id", "cookie_value")
                    }
                    content { session.toResponseDTO() }
                }
        }
    })
