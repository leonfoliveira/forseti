package io.github.leonfoliveira.judge.api.controller.contest

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.SubmissionPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.service.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.judge.common.service.submission.CreateSubmissionService
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
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests/{contestId}/submissions")
class ContestSubmissionController(
    private val contestAuthFilter: ContestAuthFilter,
    private val createSubmissionService: CreateSubmissionService,
    private val findSubmissionService: FindSubmissionService,
    private val updateSubmissionService: UpdateSubmissionService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.CONTESTANT)
    @RateLimit
    @Transactional
    @Operation(summary = "Create a submission")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Submission created successfully"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request format",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
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
                description = "Problem not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun createSubmission(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateSubmissionInputDTO,
    ): ResponseEntity<SubmissionFullResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/submissions $body")
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val member = AuthorizationContextUtil.getMember()!!
        val submission =
            createSubmissionService.create(
                memberId = member.id,
                inputDTO = body,
            )
        return ResponseEntity.ok(submission.toFullResponseDTO())
    }

    @GetMapping
    @RateLimit
    @Transactional(readOnly = true)
    @Operation(summary = "Find all contest submissions")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Submissions found successfully"),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun findAllContestSubmissions(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<SubmissionPublicResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/submissions")
        contestAuthFilter.checkIfStarted(contestId)
        val submissions = findSubmissionService.findAllByContest(contestId)
        return ResponseEntity.ok(submissions.map { it.toPublicResponseDTO() })
    }

    @GetMapping("/full")
    @Private(Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
    @RateLimit
    @Transactional(readOnly = true)
    @Operation(summary = "Find all contest full submissions")
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
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun findAllContestFullSubmissions(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/submissions/full")
        contestAuthFilter.checkIfStarted(contestId)
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val submissions = findSubmissionService.findAllByContest(contestId)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @GetMapping("/full/members/me")
    @Private(Member.Type.CONTESTANT)
    @RateLimit
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
    fun findAllFullSubmissionsForMember(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/submissions/full/members/me")
        val member = AuthorizationContextUtil.getMember()!!
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
        @PathVariable contestId: UUID,
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    ): ResponseEntity<Void> {
        logger.info("[PUT] /v1/contests/$contestId/submissions/$id/answer/$answer")
        updateSubmissionService.updateAnswer(id, answer)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}/answer/{answer}/force")
    @Private(Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
    @RateLimit
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
        @PathVariable contestId: UUID,
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    ): ResponseEntity<Void> {
        logger.info("[PUT] /v1/contests/$contestId/submissions/$id/answer/$answer/force")
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        updateSubmissionService.updateAnswer(id, answer, force = true)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/rerun")
    @Private(Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
    @RateLimit
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
        @PathVariable contestId: UUID,
        @PathVariable id: UUID,
    ): ResponseEntity<Void> {
        logger.info("[POST] /v1/contests/$contestId/submissions/$id/rerun - id: $id")
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        updateSubmissionService.rerun(id)
        return ResponseEntity.noContent().build()
    }
}
