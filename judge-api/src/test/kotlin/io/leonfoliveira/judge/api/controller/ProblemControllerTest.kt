package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.controller.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toShortResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.output.ProblemOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.output.SubmissionOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import io.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@SpringBootTest
class ProblemControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean val findProblemService: FindProblemService,
    @MockkBean val createSubmissionService: CreateSubmissionService,
) : FunSpec({
        val basePath = "/v1/problems"

        beforeEach {
            mockkStatic(SecurityContextHolder::class)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())
        }

        test("findById") {
            val problemId = 1
            val problem = ProblemOutputDTOMockFactory.build()
            every { findProblemService.findById(problemId) } returns problem

            mockMvc.get("$basePath/$problemId")
                .andExpect {
                    status { isOk() }
                    content { problem.toResponseDTO() }
                }
        }

        test("createSubmission") {
            val submission = SubmissionOutputDTOMockFactory.build()
            every { createSubmissionService.create(any(), any(), any()) } returns submission

            mockMvc.post("$basePath/1/submissions") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(CreateSubmissionInputDTOMockFactory.build())
            }.andExpect {
                status { isOk() }
                content { submission.toShortResponseDTO() }
            }
        }
    })
