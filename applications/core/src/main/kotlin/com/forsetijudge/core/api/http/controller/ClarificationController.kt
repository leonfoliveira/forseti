package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.clarification.AnswerClarificationRequestBody
import com.forsetijudge.core.api.http.dto.request.clarification.CreateClarificationRequestBody
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.input.usecase.clarification.AnswerClarificationUseCase
import com.forsetijudge.core.port.input.usecase.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.input.usecase.clarification.PublishClarificationUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ClarificationController(
    private val answerClarificationUseCase: AnswerClarificationUseCase,
    private val createClarificationUseCase: CreateClarificationUseCase,
    private val publishClarificationUseCase: PublishClarificationUseCase,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}/clarifications")
    @PreAuthorize("hasRole('CONTESTANT')")
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateClarificationRequestBody,
    ): ResponseEntity<ClarificationResponseDTO> {
        logger.info("[POST] /v1/contests/{contestId}/clarifications")
        val clarification =
            createClarificationUseCase.execute(
                CreateClarificationUseCase.Command(
                    contestId = contestId,
                    problemId = body.problemId,
                    text = body.text,
                ),
            )
        return ResponseEntity.ok(clarification)
    }

    @PatchMapping("/contests/{contestId}/clarifications/{clarificationId}/answer")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN', 'JUDGE')")
    fun answer(
        @PathVariable contestId: UUID,
        @PathVariable clarificationId: UUID,
        @RequestBody body: AnswerClarificationRequestBody,
    ): ResponseEntity<ClarificationResponseDTO> {
        logger.info("[POST] /v1/contests/{contestId}/clarifications/{clarificationId}/answer")
        val clarification =
            answerClarificationUseCase.execute(
                AnswerClarificationUseCase.Command(
                    contestId = contestId,
                    clarificationId = clarificationId,
                    text = body.text,
                ),
            )
        return ResponseEntity.ok(clarification)
    }

    @PatchMapping("/contests/{contestId}/clarifications/{clarificationId}/publish")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN', 'JUDGE')")
    fun publish(
        @PathVariable contestId: UUID,
        @PathVariable clarificationId: UUID,
    ): ResponseEntity<ClarificationResponseDTO> {
        logger.info("[POST] /v1/contests/{contestId}/clarifications/{clarificationId}/publish")
        val clarification =
            publishClarificationUseCase.execute(
                PublishClarificationUseCase.Command(
                    contestId = contestId,
                    clarificationId = clarificationId,
                ),
            )
        return ResponseEntity.ok(clarification)
    }
}
