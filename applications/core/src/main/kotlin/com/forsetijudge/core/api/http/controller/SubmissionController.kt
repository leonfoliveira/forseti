package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.submission.CreateSubmissionRequestBodyDTO
import com.forsetijudge.core.api.http.dto.request.submission.UpdateAnswerSubmissionRequestBodyDTO
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.input.usecase.submission.ResubmitSubmissionUseCase
import com.forsetijudge.core.port.input.usecase.submission.UpdateSubmissionAnswerUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class SubmissionController(
    private val createSubmissionUseCase: CreateSubmissionUseCase,
    private val resubmitSubmissionUseCase: ResubmitSubmissionUseCase,
    private val updateSubmissionAnswerUseCase: UpdateSubmissionAnswerUseCase,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}/submissions")
    @PreAuthorize("hasRole('CONTESTANT')")
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateSubmissionRequestBodyDTO,
    ): ResponseEntity<SubmissionWithCodeResponseBodyDTO> {
        logger.info("[POST] /v1/contests/$contestId/submissions")
        val submission =
            createSubmissionUseCase.execute(
                CreateSubmissionUseCase.Command(
                    contestId = contestId,
                    problemId = body.problemId,
                    language = body.language,
                    code = AttachmentCommandDTO(id = body.code.id),
                ),
            )
        return ResponseEntity.ok(submission)
    }

    @PutMapping("/contests/{contestId}/submissions/{submissionId}:resubmit")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN', 'JUDGE')")
    fun resubmit(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
    ): ResponseEntity<SubmissionWithCodeAndExecutionsResponseBodyDTO> {
        logger.info("[POST] /v1/contests/$contestId/submissions/$submissionId:resubmit")
        val submission =
            resubmitSubmissionUseCase.execute(
                ResubmitSubmissionUseCase.Command(
                    contestId = contestId,
                    submissionId = submissionId,
                ),
            )
        return ResponseEntity.ok(submission)
    }

    @PutMapping("/contests/{contestId}/submissions/{submissionId}:update-answer")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN', 'JUDGE')")
    fun updateAnswer(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @RequestBody body: UpdateAnswerSubmissionRequestBodyDTO,
    ): ResponseEntity<SubmissionWithCodeAndExecutionsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId/submissions/$submissionId:update-answer")
        val submission =
            updateSubmissionAnswerUseCase.execute(
                UpdateSubmissionAnswerUseCase.Command(
                    contestId = contestId,
                    submissionId = submissionId,
                    answer = body.answer,
                ),
            )
        return ResponseEntity.ok(submission)
    }
}
