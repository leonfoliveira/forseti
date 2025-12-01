package live.forseti.api.adapter.driving.controller.contest

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.api.adapter.dto.response.ErrorResponseDTO
import live.forseti.api.adapter.dto.response.submission.SubmissionFullResponseDTO
import live.forseti.api.adapter.dto.response.submission.SubmissionPublicResponseDTO
import live.forseti.api.adapter.dto.response.submission.toFullResponseDTO
import live.forseti.api.adapter.dto.response.submission.toPublicResponseDTO
import live.forseti.api.adapter.util.Private
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import live.forseti.core.port.driving.usecase.submission.CreateSubmissionUseCase
import live.forseti.core.port.driving.usecase.submission.FindSubmissionUseCase
import live.forseti.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import live.forseti.core.port.dto.input.submission.CreateSubmissionInputDTO
import live.forseti.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
class ContestSubmissionController(
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    private val createSubmissionUseCase: CreateSubmissionUseCase,
    private val findSubmissionUseCase: FindSubmissionUseCase,
    private val updateSubmissionUseCase: UpdateSubmissionUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/submissions")
    @Private(Member.Type.CONTESTANT, Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
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
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateSubmissionInputDTO,
    ): ResponseEntity<SubmissionFullResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/submissions $body")
        authorizeContestUseCase.checkIfStarted(contestId)
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val member = RequestContext.getContext().session!!.member
        val submission =
            createSubmissionUseCase.create(
                memberId = member.id,
                inputDTO = body,
            )
        return ResponseEntity.ok(submission.toFullResponseDTO())
    }

    @GetMapping("/contests/{contestId}/submissions")
    @Private(Member.Type.CONTESTANT, Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
    @Operation(summary = "Find all submissions")
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
    fun findAll(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<SubmissionPublicResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/submissions")
        authorizeContestUseCase.checkIfStarted(contestId)
        val submissions = findSubmissionUseCase.findAllByContest(contestId)
        return ResponseEntity.ok(submissions.map { it.toPublicResponseDTO() })
    }

    @GetMapping("/contests/{contestId}/submissions/full")
    @Private(Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
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
    fun findAllFull(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/submissions/full")
        authorizeContestUseCase.checkIfStarted(contestId)
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val submissions = findSubmissionUseCase.findAllByContest(contestId)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @GetMapping("/contests/{contestId}/submissions/members/me")
    @Private(Member.Type.CONTESTANT)
    @Operation(summary = "Find all full submissions for the signed-in member")
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
    fun findAllFullForMember(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<SubmissionFullResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/submissions/members/me")
        val member = RequestContext.getContext().session!!.member
        val submissions = findSubmissionUseCase.findAllByMember(member.id)
        return ResponseEntity.ok(submissions.map { it.toFullResponseDTO() })
    }

    @PutMapping("/contests/{contestId}/submissions/{submissionId}:update-answer")
    @Private(Member.Type.AUTOJUDGE)
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
    fun updateAnswer(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @RequestBody body: UpdateSubmissionAnswerRequestDTO,
    ): ResponseEntity<Void> {
        logger.info("[PUT] /v1/contests/$contestId/submissions/$submissionId:update-answer $body")
        updateSubmissionUseCase.updateAnswer(submissionId, body.answer)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/contests/{contestId}/submissions/{submissionId}:update-answer-force")
    @Private(Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
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
    fun updateAnswerForce(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @RequestParam body: UpdateSubmissionAnswerRequestDTO,
    ): ResponseEntity<Void> {
        logger.info("[PUT] /v1/contests/$contestId/submissions/$submissionId:update-answer-force $body")
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        updateSubmissionUseCase.updateAnswer(submissionId, body.answer, force = true)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/contests/{contestId}/submissions/{submissionId}:rerun")
    @Private(Member.Type.JUDGE, Member.Type.ROOT, Member.Type.ADMIN)
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
        @PathVariable submissionId: UUID,
    ): ResponseEntity<Void> {
        logger.info("[POST] /v1/contests/$contestId/submissions/$submissionId:rerun")
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        updateSubmissionUseCase.rerun(submissionId)
        return ResponseEntity.noContent().build()
    }
}
