package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.ContestFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.ContestMetadataResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.ContestPublicOutputDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toMetadataDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toPublicOutputDTO
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.service.contest.CreateContestService
import io.github.leonfoliveira.judge.common.service.contest.DeleteContestService
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import io.github.leonfoliveira.judge.common.service.contest.UpdateContestService
import io.github.leonfoliveira.judge.common.service.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.UpdateContestInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests")
class ContestController(
    private val contestAuthFilter: ContestAuthFilter,
    private val createContestService: CreateContestService,
    private val updateContestService: UpdateContestService,
    private val findContestService: FindContestService,
    private val deleteContestService: DeleteContestService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.ROOT)
    @Transactional
    @Operation(summary = "Create a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest created successfully"),
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
                responseCode = "409",
                description = "Conflict",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun createContest(
        @RequestBody body: CreateContestInputDTO,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[POST] /v1/contests $body")
        val contest = createContestService.create(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @PutMapping
    @Private(Member.Type.ADMIN)
    @RateLimit
    @Transactional
    @Operation(summary = "Update a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest updated successfully"),
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
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "409",
                description = "Conflict",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun updateContest(
        @RequestBody body: UpdateContestInputDTO,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[PUT] /v1/contests - $body")
        contestAuthFilter.checkIfMemberBelongsToContest(body.id)
        val contest = updateContestService.update(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/metadata")
    @Private(Member.Type.ROOT)
    @Transactional(readOnly = true)
    @Operation(summary = "Find all contest metadata")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest metadata found successfully"),
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
        ],
    )
    fun findAllContestMetadata(): ResponseEntity<List<ContestMetadataResponseDTO>> {
        logger.info("[GET] /v1/contests/metadata")
        val contests = findContestService.findAll()
        return ResponseEntity.ok(contests.map { it.toMetadataDTO() })
    }

    @GetMapping("/slug/{contestSlug}/metadata")
    @RateLimit
    @Transactional(readOnly = true)
    @Operation(summary = "Find contest metadata by slug")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest metadata found successfully"),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun findContestMetadataBySlug(
        @PathVariable contestSlug: String,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[GET] /v1/contests/slug/$contestSlug/metadata")
        val contest = findContestService.findBySlug(contestSlug)
        return ResponseEntity.ok(contest.toMetadataDTO())
    }

    @GetMapping("/{contestId}")
    @RateLimit
    @Transactional(readOnly = true)
    @Operation(summary = "Find contest by id")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest found successfully"),
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
    fun findContestById(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestPublicOutputDTO> {
        logger.info("[GET] /v1/contests/$contestId")
        contestAuthFilter.checkIfStarted(contestId)
        val contest = findContestService.findById(contestId)
        return ResponseEntity.ok(contest.toPublicOutputDTO())
    }

    @GetMapping("/{contestId}/full")
    @Private(Member.Type.ADMIN)
    @RateLimit
    @Transactional(readOnly = true)
    @Operation(summary = "Find full contest by id")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest found successfully"),
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
    fun findFullContestById(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[GET] /v1/contests/$contestId/full")
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val contest = findContestService.findById(contestId)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @PutMapping("/{contestId}/start")
    @Private(Member.Type.ADMIN)
    @RateLimit
    @Transactional
    @Operation(summary = "Force start a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest started successfully"),
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
    fun forceStartContest(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[PUT] /v1/contests/$contestId/start")
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val contest = updateContestService.forceStart(contestId)
        return ResponseEntity.ok().body(contest.toMetadataDTO())
    }

    @PutMapping("/{contestId}/end")
    @Private(Member.Type.ADMIN)
    @RateLimit
    @Transactional
    @Operation(summary = "Force end a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest ended successfully"),
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
    fun forceEndContest(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[PUT] /v1/contests/$contestId/end")
        contestAuthFilter.checkIfMemberBelongsToContest(contestId)
        val contest = updateContestService.forceEnd(contestId)
        return ResponseEntity.ok().body(contest.toMetadataDTO())
    }

    @DeleteMapping("/{contestId}")
    @Private(Member.Type.ROOT)
    @Transactional
    @Operation(summary = "Delete a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "Contest deleted successfully"),
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
    fun deleteContest(
        @PathVariable contestId: UUID,
    ): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/contests/$contestId")
        deleteContestService.delete(contestId)
        return ResponseEntity.noContent().build()
    }
}
