package io.github.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@WebMvcTest(controllers = [AuthenticationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [AuthenticationController::class])
class AuthenticationControllerTest(
    @MockkBean(relaxed = true)
    private val authorizationService: AuthorizationService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val objectMapper = jacksonObjectMapper()

        val authenticateInputDTO =
            AuthenticateInputDTO(
                contestId = null,
                login = "testUser",
                password = "testPassword",
            )

        test("getAuthorization") {
            val authorization = AuthorizationMockBuilder.build()
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)

            webMvc.get("/v1/auth/me")
                .andExpect {
                    status { isOk() }
                    content { authorization }
                }
        }

        test("cleanAuthorization") {
            webMvc.delete("/v1/auth/me")
                .andExpect {
                    status { isNoContent() }
                    cookie {
                        value("access_token", "")
                        path("access_token", "/")
                        maxAge("access_token", 0)
                        secure("access_token", true)
                        httpOnly("access_token", true)
                        sameSite("access_token", "Lax")
                    }
                }
        }

        test("authenticate") {
            val authorization = AuthorizationMockBuilder.build()
            val token = "token"
            every { authorizationService.authenticate(authenticateInputDTO) } returns authorization
            every { authorizationService.encodeToken(authorization) } returns token

            webMvc.post("/v1/auth/sign-in") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(authenticateInputDTO)
            }.andExpect {
                status { isOk() }
                cookie {
                    value("access_token", token)
                    path("access_token", "/")
                    secure("access_token", true)
                    httpOnly("access_token", true)
                    sameSite("access_token", "Lax")
                }
                content { authorization }
            }
        }
    })
