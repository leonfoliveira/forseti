package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.request.clarification.CreateClarificationRequestBodyDTO
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.driving.usecase.external.clarification.DeleteClarificationUseCase
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
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
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.post

@WebMvcTest(controllers = [ContestClarificationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestClarificationController::class])
class ContestClarificationControllerTest(
    @MockkBean(relaxed = true)
    private val createClarificationUseCase: CreateClarificationUseCase,
    @MockkBean(relaxed = true)
    private val deleteClarificationUseCase: DeleteClarificationUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/clarifications"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("create") {
            val body =
                CreateClarificationRequestBodyDTO(
                    text = "This is a test clarification",
                )
            val clarification = ClarificationMockBuilder.build()
            val command =
                CreateClarificationUseCase.Command(
                    text = body.text,
                )
            every {
                createClarificationUseCase.execute(
                    command,
                )
            } returns clarification

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { clarification.toResponseBodyDTO() }
                }

            verify { createClarificationUseCase.execute(command) }
        }

        test("deleteClarificationById") {
            val clarificationId = IdGenerator.getUUID()
            val command =
                DeleteClarificationUseCase.Command(
                    clarificationId = clarificationId,
                )

            webMvc
                .delete("$basePath/{clarificationId}", contestId, clarificationId)
                .andExpect {
                    status { isNoContent() }
                }

            verify { deleteClarificationUseCase.execute(command) }
        }
    })
