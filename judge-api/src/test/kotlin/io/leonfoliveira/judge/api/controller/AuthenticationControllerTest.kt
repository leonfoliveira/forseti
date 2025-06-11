package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.Authorization
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.leonfoliveira.judge.core.dto.input.authorization.AuthenticateMemberInputDTOMockFactory
import io.leonfoliveira.judge.core.dto.input.authorization.AuthenticateRootInputDTOMockFactory
import io.mockk.every
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import java.util.UUID

@ControllerTest([AuthenticationController::class])
class AuthenticationControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean val authorizationService: AuthorizationService,
) : FunSpec({
        val basePath = "/v1/auth"

        test("authenticateRoot") {
            val authorizationOutputDTO =
                Authorization(
                    member = AuthorizationMember.ROOT,
                    accessToken = "token",
                )
            every { authorizationService.authenticateRoot(any()) }
                .returns(authorizationOutputDTO)

            mockMvc.post("$basePath/root/sign-in") {
                contentType = MediaType.APPLICATION_JSON
                content =
                    objectMapper.writeValueAsString(AuthenticateRootInputDTOMockFactory.build())
            }.andExpect {
                status { isOk() }
                content { authorizationOutputDTO }
            }
        }

        test("authenticateMember") {
            val contestId = UUID.randomUUID()
            val login = "login"
            val authorizationOutputDTO =
                Authorization(
                    member =
                        AuthorizationMember(
                            id = UUID.randomUUID(),
                            name = "name",
                            login = login,
                            type = Member.Type.CONTESTANT,
                        ),
                    accessToken = "token",
                )
            every { authorizationService.authenticateMember(contestId, any()) }
                .returns(authorizationOutputDTO)

            mockMvc.post("$basePath/contests/$contestId/sign-in") {
                contentType = MediaType.APPLICATION_JSON
                content =
                    objectMapper.writeValueAsString(
                        AuthenticateMemberInputDTOMockFactory.build(),
                    )
            }.andExpect {
                status { isOk() }
                content { authorizationOutputDTO }
            }
        }
    })
