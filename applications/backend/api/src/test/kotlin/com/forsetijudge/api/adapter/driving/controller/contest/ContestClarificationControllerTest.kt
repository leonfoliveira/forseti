package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.driving.usecase.clarification.DeleteClarificationUseCase
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import com.forsetijudge.core.port.dto.input.clarification.CreateClarificationInputDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.post
import java.util.UUID

@WebMvcTest(controllers = [ContestClarificationController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestClarificationController::class])
class ContestClarificationControllerTest(
    @MockkBean(relaxed = true)
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    @MockkBean(relaxed = true)
    private val createClarificationUseCase: CreateClarificationUseCase,
    @MockkBean(relaxed = true)
    private val deleteClarificationUseCase: DeleteClarificationUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/clarifications"

        test("createClarification") {
            val contestId = UUID.randomUUID()
            val body =
                CreateClarificationInputDTO(
                    text = "This is a test clarification",
                )
            val clarification = ClarificationMockBuilder.build()
            val session = SessionMockBuilder.build()
            RequestContext.getContext().session = session
            every { createClarificationUseCase.create(contestId, session.member.id, body) } returns clarification

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { clarification.toResponseDTO() }
                }

            verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
        }

        test("deleteClarificationById") {
            val contestId = UUID.randomUUID()
            val clarificationId = UUID.randomUUID()

            webMvc
                .delete("$basePath/{clarificationId}", contestId, clarificationId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { deleteClarificationUseCase.delete(clarificationId) }
        }
    })
