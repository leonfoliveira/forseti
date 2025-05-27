package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.controller.dto.response.toPrivateResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTOMockFactory
import io.leonfoliveira.judge.core.service.submission.CreateSubmissionService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@ControllerTest([SubmissionController::class])
class SubmissionControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean val findSubmissionService: FindSubmissionService,
    @MockkBean val createSubmissionService: CreateSubmissionService
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
})
