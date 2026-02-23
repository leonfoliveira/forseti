package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.dto.request.submission.CreateSubmissionRequestBodyDTO
import com.forsetijudge.api.adapter.dto.request.submission.UpdateAnswerSubmissionRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.ResetSubmissionUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.UpdateAnswerSubmissionUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
class ContestSubmissionController(
    private val createSubmissionUseCase: CreateSubmissionUseCase,
    private val resetSubmissionUseCase: ResetSubmissionUseCase,
    private val updateAnswerSubmissionUseCase: UpdateAnswerSubmissionUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/submissions")
    @Private(Member.Type.CONTESTANT)
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateSubmissionRequestBodyDTO,
    ): ResponseEntity<SubmissionWithCodeResponseBodyDTO> {
        logger.info("[POST] /v1/contests/{}/submissions", contestId)
        val submission =
            createSubmissionUseCase.execute(
                CreateSubmissionUseCase.Command(
                    problemId = body.problemId,
                    language = body.language,
                    code = AttachmentCommandDTO(id = body.code.id),
                ),
            )
        return ResponseEntity.ok(submission.toWithCodeResponseBodyDTO())
    }

    @PostMapping("/contests/{contestId}/submissions/{submissionId}:rerun")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
    fun rerun(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
    ): ResponseEntity<Void> {
        logger.info("[POST] /v1/contests/{}/submissions/{}:rerun", contestId, submissionId)
        resetSubmissionUseCase.execute(
            ResetSubmissionUseCase.Command(
                submissionId = submissionId,
            ),
        )
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/contests/{contestId}/submissions/{submissionId}:update-answer")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
    fun updateAnswer(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @RequestBody body: UpdateAnswerSubmissionRequestBodyDTO,
    ): ResponseEntity<Void> {
        logger.info("[PUT] /v1/contests/{}/submissions/{}:update-answer", contestId, submissionId)
        updateAnswerSubmissionUseCase.execute(
            UpdateAnswerSubmissionUseCase.Command(
                submissionId = submissionId,
                answer = body.answer,
            ),
        )
        return ResponseEntity.noContent().build()
    }
}
