package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.dto.request.attachment.AttachmentRequestBodyDTO
import com.forsetijudge.api.adapter.dto.request.submission.CreateSubmissionRequestBodyDTO
import com.forsetijudge.api.adapter.dto.request.submission.UpdateAnswerSubmissionRequestBodyDTO
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.ResetSubmissionUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.UpdateAnswerSubmissionUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
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
import org.springframework.test.web.servlet.put

@WebMvcTest(controllers = [ContestSubmissionController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestSubmissionController::class])
class ContestSubmissionControllerTest(
    @MockkBean(relaxed = true)
    private val createSubmissionUseCase: CreateSubmissionUseCase,
    @MockkBean(relaxed = true)
    private val resetSubmissionUseCase: ResetSubmissionUseCase,
    @MockkBean(relaxed = true)
    private val updateAnswerSubmissionUseCase: UpdateAnswerSubmissionUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/submissions"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("create") {
            val body =
                CreateSubmissionRequestBodyDTO(
                    problemId = IdGenerator.getUUID(),
                    language = Submission.Language.PYTHON_312,
                    code = AttachmentRequestBodyDTO(id = IdGenerator.getUUID()),
                )
            val submission = SubmissionMockBuilder.build()
            val command =
                CreateSubmissionUseCase.Command(
                    problemId = body.problemId,
                    language = body.language,
                    code = AttachmentCommandDTO(id = body.code.id),
                )
            every {
                createSubmissionUseCase.execute(command)
            } returns submission

            webMvc
                .post(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { submission.toWithCodeResponseBodyDTO() }
                }

            verify { createSubmissionUseCase.execute(command) }
        }

        test("rerun") {
            val id = IdGenerator.getUUID()
            val submission = SubmissionMockBuilder.build(id = id)
            val command =
                ResetSubmissionUseCase.Command(
                    submissionId = id,
                )
            every { resetSubmissionUseCase.execute(command) } returns submission

            webMvc
                .put("$basePath/{id}:rerun", contestId, id)
                .andExpect {
                    status { isOk() }
                    content { submission.toWithCodeAndExecutionResponseBodyDTO() }
                }

            verify { resetSubmissionUseCase.execute(command) }
        }

        test("updateAnswer") {
            val id = IdGenerator.getUUID()
            val answer = Submission.Answer.ACCEPTED
            val body = UpdateAnswerSubmissionRequestBodyDTO(answer = answer)
            val submission = SubmissionMockBuilder.build(id = id)
            val command =
                UpdateAnswerSubmissionUseCase.Command(
                    submissionId = id,
                    answer = answer,
                )
            every { updateAnswerSubmissionUseCase.execute(command) } returns submission

            webMvc
                .put("$basePath/{id}:update-answer", contestId, id) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { submission.toWithCodeAndExecutionResponseBodyDTO() }
                }

            verify { updateAnswerSubmissionUseCase.execute(command) }
        }
    })
