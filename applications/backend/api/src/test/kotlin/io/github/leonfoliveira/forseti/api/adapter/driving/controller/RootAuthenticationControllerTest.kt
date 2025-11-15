package io.github.leonfoliveira.forseti.api.adapter.driving.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.dto.request.NoLoginAuthenticateRequestDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.SessionCookieUtil
import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.AuthenticateInputDTO
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

@WebMvcTest(controllers = [RootController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [RootController::class])
class RootAuthenticationControllerTest(
    @MockkBean(relaxed = true)
    private val authenticationUseCase: AuthenticationUseCase,
    @MockkBean(relaxed = true)
    private val sessionCookieUtil: SessionCookieUtil,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        test("authenticateRoot") {
            val body = NoLoginAuthenticateRequestDTO(password = "password")
            val session = SessionMockBuilder.build()
            val authenticateInputDTO =
                AuthenticateInputDTO(
                    login = Member.ROOT_LOGIN,
                    password = body.password,
                )
            every { authenticationUseCase.authenticate(authenticateInputDTO) } returns session
            every { sessionCookieUtil.buildCookie(session) } returns "session_id=cookie_value"

            webMvc
                .post("/v1/root/sign-in") {
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
