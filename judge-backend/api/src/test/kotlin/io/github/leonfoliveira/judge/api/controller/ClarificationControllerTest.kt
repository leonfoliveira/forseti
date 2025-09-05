package io.github.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ClarificationMockBuilder
import io.github.leonfoliveira.judge.common.service.clarification.CreateClarificationService
import io.github.leonfoliveira.judge.common.service.clarification.DeleteClarificationService
import io.github.leonfoliveira.judge.common.service.dto.input.clarification.CreateClarificationInputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.post
import java.util.UUID

@WebMvcTest(controllers = [ClarificationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ClarificationController::class])
class ClarificationControllerTest(
    @MockkBean(relaxed = true)
    private val deleteClarificationService: DeleteClarificationService,
    @MockkBean(relaxed = true)
    private val createClarificationService: CreateClarificationService,
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/clarifications"

        test("createClarification") {
            val contestId = UUID.randomUUID()
            val body =
                CreateClarificationInputDTO(
                    text = "This is a test clarification",
                )
            val clarification = ClarificationMockBuilder.build()
            val authorization = AuthorizationMockBuilder.build()
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)
            every { createClarificationService.create(contestId, authorization.member.id, body) } returns clarification

            webMvc.post(basePath, contestId) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(body)
            }.andExpect {
                status { isOk() }
                content { clarification.toResponseDTO() }
            }

            verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
        }

        test("deleteClarificationById") {
            val contestId = UUID.randomUUID()
            val id = UUID.randomUUID()

            webMvc.delete("$basePath/{clarificationId}", contestId, id) {
                contentType = MediaType.APPLICATION_JSON
            }.andExpect {
                status { isNoContent() }
            }

            verify { deleteClarificationService.delete(id) }
        }
    })
