package live.forseti.api.adapter.driving.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import live.forseti.api.adapter.dto.request.NoLoginAuthenticateRequestDTO
import live.forseti.api.adapter.dto.response.session.toResponseDTO
import live.forseti.api.adapter.util.SessionCookieUtil
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.port.driving.usecase.authentication.AuthenticateUseCase
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO
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
    private val authenticateUseCase: AuthenticateUseCase,
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
            every { authenticateUseCase.authenticate(authenticateInputDTO) } returns session
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
