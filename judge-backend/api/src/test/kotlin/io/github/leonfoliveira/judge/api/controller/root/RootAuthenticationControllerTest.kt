package io.github.leonfoliveira.judge.api.controller.root

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.service.AuthorizationCookieService
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.ContestAuthenticateInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.RootAuthenticateInputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@WebMvcTest(controllers = [RootAuthenticationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [RootAuthenticationController::class])
class RootAuthenticationControllerTest(
    @MockkBean(relaxed = true)
    private val authorizationService: AuthorizationService,
    @MockkBean(relaxed = true)
    private val authorizationCookieService: AuthorizationCookieService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val objectMapper = jacksonObjectMapper()

        val authenticateInputDTO =
            RootAuthenticateInputDTO(
                password = "testPassword",
            )

        test("authenticateRoot") {
            val authorization = AuthorizationMockBuilder.build()
            val token =
                "access_token=mocked_token; Max-Age=3600; Expires=${authorization.expiresAt.toInstant()}; " +
                    "Path=/; HttpOnly; SameSite=Lax; Secure"
            every { authorizationService.authenticateRoot(authenticateInputDTO) } returns authorization
            every { authorizationService.encodeToken(authorization) } returns token
            every { authorizationCookieService.buildCookie(authorization) } returns token

            webMvc
                .post("/v1/root/sign-in") {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(authenticateInputDTO)
                }.andExpect {
                    status { isOk() }
                    cookie {
                        value("access_token", "mocked_token")
                        path("access_token", "/")
                        secure("access_token", true)
                        httpOnly("access_token", true)
                        sameSite("access_token", "Lax")
                    }
                    content { authorization }
                }
        }
    })
