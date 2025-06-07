package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.dto.request.UpdateSubmissionAnswerRequestDTO
import io.leonfoliveira.judge.api.dto.response.toFullResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTOMockFactory
import io.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.leonfoliveira.judge.core.service.submission.RunSubmissionService
import io.leonfoliveira.judge.core.service.submission.UpdateSubmissionService
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.verify
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import java.util.UUID

@ControllerTest([SubmissionController::class])
class SubmissionControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean(relaxed = true) val findSubmissionService: FindSubmissionService,
    @MockkBean(relaxed = true) val createSubmissionService: CreateSubmissionService,
    @MockkBean(relaxed = true) val updateSubmissionService: UpdateSubmissionService,
    @MockkBean(relaxed = true) val runSubmissionService: RunSubmissionService,
) : FunSpec({
        beforeEach {
            mockkStatic(SecurityContextHolder::class)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())
        }

        val basePath = "/v1/submissions"

        test("createSubmission") {
            val submission = SubmissionMockFactory.build()
            val inputDTO = CreateSubmissionInputDTOMockFactory.build()
            every { createSubmissionService.create(any(), any()) }
                .returns(submission)

            mockMvc.post(basePath) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(inputDTO)
            }
                .andExpect {
                    status { isOk() }
                    content { submission.toFullResponseDTO() }
                }
        }

        test("findAllForMember") {
            val submissions = listOf(SubmissionMockFactory.build())
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())
            every { findSubmissionService.findAllByMember(any()) }
                .returns(submissions)

            mockMvc.get("$basePath/full/me")
                .andExpect {
                    status { isOk() }
                    content { submissions.map { it.toFullResponseDTO() } }
                }
        }

        test("judge") {
            val submissionId = UUID.randomUUID()
            val requestBody = UpdateSubmissionAnswerRequestDTO(answer = Submission.Answer.ACCEPTED)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildJudge())

            mockMvc.patch("$basePath/$submissionId/judge") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(requestBody)
            }
                .andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionService.judge(submissionId, requestBody.answer) }
        }

        test("rerunSubmission") {
            val submissionId = UUID.randomUUID()
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildJudge())

            mockMvc.post("$basePath/$submissionId/rerun") {
                contentType = MediaType.APPLICATION_JSON
            }
                .andExpect {
                    status { isNoContent() }
                }

            verify { runSubmissionService.rerun(submissionId) }
        }
    })
