package io.github.leonfoliveira.judge.api.controller

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [AuthorizationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [AuthorizationController::class])
class AuthorizationControllerTest(
    @MockkBean(relaxed = true)
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        test("getAuthorization") {
            val authorization = AuthorizationMockBuilder.build()
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)

            webMvc
                .get("/v1/auth/me")
                .andExpect {
                    status { isOk() }
                    content { authorization }
                }
        }
    })
