package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/submissions")
class SubmissionController(
    private val contestAuthFilter: ContestAuthFilter,
    private val findSubmissionService: FindSubmissionService,
    private val updateSubmissionService: UpdateSubmissionService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/full/me")
    @Private(Member.Type.CONTESTANT)
    @Transactional(readOnly = true)
    @Operation(summary = "Find all full submissions for a member")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Submissions found successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Member not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun findAllFullSubmissionsForMember(): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/submissions/me")
        val member = AuthorizationContextUtil.getMember()
        val submissions = findSubmissionService.findAllByMember(member.id)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @PutMapping("/{id}/answer/{answer}")
    @Private(Member.Type.AUTOJUDGE)
    @Transactional
    @Operation(summary = "Update a submission answer")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "Submission answer updated successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Submission not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun updateSubmissionAnswer(
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    ): ResponseEntity<Void> {
        logger.info("[PATCH] /v1/submissions/{id}/answer - id: $id, answer: $answer")
        updateSubmissionService.updateAnswer(id, answer)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}/answer/{answer}/force")
    @Private(Member.Type.JUDGE)
    @Transactional
    @Operation(summary = "Force update a submission answer")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "Submission answer updated successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Submission not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun updateSubmissionAnswerForce(
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    ): ResponseEntity<Void> {
        logger.info("[PATCH] /v1/submissions/{id}/answer/force - id: $id, answer: $answer")
        contestAuthFilter.checkFromSubmission(id)
        updateSubmissionService.updateAnswer(id, answer, force = true)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/rerun")
    @Private(Member.Type.JUDGE)
    @Transactional
    @Operation(summary = "Rerun a submission")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "Submission rerun successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Submission not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun rerunSubmission(
        @PathVariable id: UUID,
    ): ResponseEntity<Void> {
        logger.info("[POST] /v1/submissions/$id/rerun - id: $id")
        contestAuthFilter.checkFromSubmission(id)
        updateSubmissionService.rerun(id)
        return ResponseEntity.noContent().build()
    }
}
