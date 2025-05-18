package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.controller.dto.request.AuthenticateMemberRequestDTO
import io.leonfoliveira.judge.api.controller.dto.request.AuthenticateRootRequestDTO
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.leonfoliveira.judge.core.domain.model.Authorization
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@SpringBootTest
class AuthenticationControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean val authorizationService: AuthorizationService,
) : FunSpec({
        val basePath = "/v1/auth"

        test("authenticateRoot") {
            val password = "rootPassword"
            val authorizationOutputDTO =
                Authorization(
                    member = AuthorizationMember.ROOT,
                    accessToken = "token",
                )
            every { authorizationService.authenticateRoot(password) }
                .returns(authorizationOutputDTO)

            mockMvc.post("$basePath/root") {
                contentType = MediaType.APPLICATION_JSON
                content =
                    objectMapper.writeValueAsString(
                        AuthenticateRootRequestDTO(password = password),
                    )
            }.andExpect {
                status { isOk() }
                content { authorizationOutputDTO }
            }
        }

        test("authenticateMember") {
            val contestId = 1
            val login = "login"
            val password = "password"
            val authorizationOutputDTO =
                Authorization(
                    member =
                        AuthorizationMember(
                            id = 1,
                            name = "name",
                            login = login,
                            type = Member.Type.CONTESTANT,
                        ),
                    accessToken = "token",
                )
            every { authorizationService.authenticateMember(contestId, login, password) }
                .returns(authorizationOutputDTO)

            mockMvc.post("$basePath/contests/$contestId") {
                contentType = MediaType.APPLICATION_JSON
                content =
                    objectMapper.writeValueAsString(
                        AuthenticateMemberRequestDTO(login = login, password = password),
                    )
            }.andExpect {
                status { isOk() }
                content { authorizationOutputDTO }
            }
        }
    })
