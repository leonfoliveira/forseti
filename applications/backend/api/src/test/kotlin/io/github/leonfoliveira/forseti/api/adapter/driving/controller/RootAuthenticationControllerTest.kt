package io.github.leonfoliveira.forseti.api.adapter.driving.controller

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.dto.request.NoLoginAuthenticateRequestDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.SessionCookieUtil
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.AuthenticateInputDTO
import io.github.leonfoliveira.forseti.common.application.service.authentication.AuthenticationService
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

@WebMvcTest(controllers = [RootController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [RootController::class])
class RootAuthenticationControllerTest(
    @MockkBean(relaxed = true)
    private val authenticationService: AuthenticationService,
    @MockkBean(relaxed = true)
    private val sessionCookieUtil: SessionCookieUtil,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val objectMapper = jacksonObjectMapper()

        val noLoginAuthenticateRequestDTO =
            NoLoginAuthenticateRequestDTO(password = "testPassword")

        val authenticateInputDTO =
            AuthenticateInputDTO(
                login = "root",
                password = "testPassword",
            )

        test("authenticateRoot") {
            val session = SessionMockBuilder.build()
            val token =
                "session_id=${session.id}; Max-Age=3600; Expires=${session.expiresAt.toInstant()}; " +
                    "Path=/; HttpOnly; SameSite=Lax; Secure"
            every { authenticationService.authenticate(authenticateInputDTO) } returns session
            every { sessionCookieUtil.buildCookie(session) } returns token

            webMvc
                .post("/v1/root/sign-in") {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(noLoginAuthenticateRequestDTO)
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
