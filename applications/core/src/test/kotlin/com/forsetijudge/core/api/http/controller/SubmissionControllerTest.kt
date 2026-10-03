package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.input.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.input.usecase.submission.ResubmitSubmissionUseCase
import com.forsetijudge.core.port.input.usecase.submission.UpdateSubmissionAnswerUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

class SubmissionControllerTest {
    private val create = mock<CreateSubmissionUseCase>()
    private val resubmit = mock<ResubmitSubmissionUseCase>()
    private val updateAnswer = mock<UpdateSubmissionAnswerUseCase>()
    private val mvc = MockMvcTestSupport.mvc(SubmissionController(create, resubmit, updateAnswer))
    private val contestId = UUID.randomUUID()
    private val submissionId = UUID.randomUUID()
    private val problemId = UUID.randomUUID()
    private val codeId = UUID.randomUUID()

    @Test
    fun `posts a submission request and maps code attachment`() {
        whenever(create.execute(any())).thenReturn(
            MockMvcTestSupport.submissionResponse(
                id = submissionId,
                contestId = contestId,
                problemId = problemId,
                codeId = codeId,
            ),
        )

        mvc
            .perform(
                post("/v1/contests/$contestId/submissions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"problemId":"$problemId","language":"CPP_17","code":{"id":"$codeId"}}""",
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(submissionId.toString()))
            .andExpect(jsonPath("$.code.id").value(codeId.toString()))

        verify(create).execute(
            CreateSubmissionUseCase.Command(
                contestId,
                problemId,
                Submission.Language.CPP_17,
                AttachmentCommandDTO(codeId),
            ),
        )
    }

    @Test
    fun `resubmits a submission using both route ids`() {
        whenever(resubmit.execute(any())).thenReturn(
            MockMvcTestSupport.submissionWithExecutionsResponse(
                id = submissionId,
                contestId = contestId,
            ),
        )

        mvc
            .perform(put("/v1/contests/$contestId/submissions/$submissionId:resubmit"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(submissionId.toString()))

        verify(resubmit).execute(ResubmitSubmissionUseCase.Command(contestId, submissionId))
    }

    @Test
    fun `updates submission answer from request body`() {
        whenever(updateAnswer.execute(any())).thenReturn(
            MockMvcTestSupport.submissionWithExecutionsResponse(
                id = submissionId,
                contestId = contestId,
            ),
        )

        mvc
            .perform(
                put("/v1/contests/$contestId/submissions/$submissionId:update-answer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"answer":"ACCEPTED"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.answer").value("ACCEPTED"))

        verify(updateAnswer).execute(
            UpdateSubmissionAnswerUseCase.Command(
                contestId,
                submissionId,
                Submission.Answer.ACCEPTED,
            ),
        )
    }
}
