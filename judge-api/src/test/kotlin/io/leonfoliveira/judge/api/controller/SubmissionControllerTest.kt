package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.controller.dto.request.UpdateSubmissionStatusRequestDTO
import io.leonfoliveira.judge.api.controller.dto.response.toPrivateResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTOMockFactory
import io.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
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

@ControllerTest([SubmissionController::class])
class SubmissionControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean(relaxed = true) val findSubmissionService: FindSubmissionService,
    @MockkBean(relaxed = true) val createSubmissionService: CreateSubmissionService,
    @MockkBean(relaxed = true) val updateSubmissionService: UpdateSubmissionService,
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
                    content { submission.toPrivateResponseDTO() }
                }
        }

        test("findAllForMember") {
            val submissions = listOf(SubmissionMockFactory.build())
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())
            every { findSubmissionService.findAllByMember(any()) }
                .returns(submissions)

            mockMvc.get("$basePath/me")
                .andExpect {
                    status { isOk() }
                    content { submissions.map { it.toPrivateResponseDTO() } }
                }
        }

        test("updateSubmissionStatus") {
            val submissionId = 1
            val requestBody = UpdateSubmissionStatusRequestDTO(status = Submission.Status.ACCEPTED)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildJudge())

            mockMvc.patch("$basePath/$submissionId/status") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(requestBody)
            }
                .andExpect {
                    status { isNoContent() }
                }

            verify { updateSubmissionService.updateStatus(submissionId, requestBody.status) }
        }
    })
