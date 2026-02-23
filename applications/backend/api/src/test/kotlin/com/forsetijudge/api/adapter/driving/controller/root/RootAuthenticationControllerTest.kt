package com.forsetijudge.api.adapter.driving.controller.root

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.request.authentication.AuthenticateRootRequestBodyDTO
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@WebMvcTest(controllers = [RootAuthenticationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [RootAuthenticationController::class])
class RootAuthenticationControllerTest(
    @MockkBean(relaxed = true)
    private val signInUseCase: SignInUseCase,
    @MockkBean(relaxed = true)
    private val sessionCookieBuilder: SessionCookieBuilder,
    @MockkBean(relaxed = true)
    private val csrfCookieBuilder: CsrfCookieBuilder,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(null, null)
        }

        test("authenticateRoot") {
            val body = AuthenticateRootRequestBodyDTO(password = "password")
            val session = SessionMockBuilder.build()
            val command =
                SignInUseCase.Command(
                    login = Member.ROOT_LOGIN,
                    password = body.password,
                )
            every { signInUseCase.execute(command) } returns session
            every { sessionCookieBuilder.buildCookie(session.toResponseBodyDTO()) } returns "session_id=cookie_value"
            every { csrfCookieBuilder.buildCookie(session.toResponseBodyDTO()) } returns "csrf_token=cookie_value"

            webMvc
                .post("/v1/root:sign-in") {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    cookie {
                        value("session_id", "cookie_value")
                        value("csrf_token", "cookie_value")
                    }
                    content { session.toResponseBodyDTO() }
                }

            verify { signInUseCase.execute(command) }
        }
    })
