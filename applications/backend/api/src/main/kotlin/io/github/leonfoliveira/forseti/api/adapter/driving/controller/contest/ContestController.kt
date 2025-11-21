package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import io.github.leonfoliveira.forseti.api.adapter.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.contest.ContestFullResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.contest.ContestMetadataResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.contest.ContestPublicOutputDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.contest.toFullResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.contest.toMetadataDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.contest.toPublicOutputDTO
import io.github.leonfoliveira.forseti.api.adapter.util.Private
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.core.domain.entity.Member
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import live.forseti.core.port.driving.usecase.contest.CreateContestUseCase
import live.forseti.core.port.driving.usecase.contest.DeleteContestUseCase
import live.forseti.core.port.driving.usecase.contest.FindContestUseCase
import live.forseti.core.port.driving.usecase.contest.UpdateContestUseCase
import live.forseti.core.port.dto.input.contest.CreateContestInputDTO
import live.forseti.core.port.dto.input.contest.UpdateContestInputDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
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
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    private val createContestUseCase: CreateContestUseCase,
    private val updateContestUseCase: UpdateContestUseCase,
    private val findContestUseCase: FindContestUseCase,
    private val deleteContestUseCase: DeleteContestUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private(Member.Type.ROOT)
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
        val contest = createContestUseCase.create(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @PutMapping
    @Private(Member.Type.ADMIN)
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
        authorizeContestUseCase.checkIfMemberBelongsToContest(body.id)
        val contest = updateContestUseCase.update(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/metadata")
    @Private(Member.Type.ROOT)
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
        logger.info("[GET] /v1contests/metadata")
        val contests = findContestUseCase.findAll()
        return ResponseEntity.ok(contests.map { it.toMetadataDTO() })
    }

    @GetMapping("/slug/{contestSlug}/metadata")
    @Operation(summary = "Find contest metadata by slug")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest metadata found successfully"),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun findContestMetadataBySlug(
        @PathVariable contestSlug: String,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[GET] /v1/contests/slug/$contestSlug/metadata")
        val contest = findContestUseCase.findBySlug(contestSlug)
        return ResponseEntity.ok(contest.toMetadataDTO())
    }

    @GetMapping("/{contestId}")
    @Operation(summary = "Find contest by id")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest found successfully"),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun findContestById(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestPublicOutputDTO> {
        logger.info("[GET] /v1/contests/$contestId")
        authorizeContestUseCase.checkIfStarted(contestId)
        val contest = findContestUseCase.findById(contestId)
        return ResponseEntity.ok(contest.toPublicOutputDTO())
    }

    @GetMapping("/{contestId}/full")
    @Private(Member.Type.ADMIN)
    @Operation(summary = "Find full contest by id")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest found successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun findFullContestById(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestFullResponseDTO> {
        logger.info("[GET] /v1/contests/$contestId/full")
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val contest = findContestUseCase.findById(contestId)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @PutMapping("/{contestId}/start")
    @Private(Member.Type.ADMIN)
    @Operation(summary = "Force start a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest started successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun forceStartContest(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[PUT] /v1/contests/$contestId/start")
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val contest = updateContestUseCase.forceStart(contestId)
        return ResponseEntity.ok().body(contest.toMetadataDTO())
    }

    @PutMapping("/{contestId}/end")
    @Private(Member.Type.ADMIN)
    @Operation(summary = "Force end a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest ended successfully"),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun forceEndContest(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestMetadataResponseDTO> {
        logger.info("[PUT] /v1/contests/$contestId/end")
        authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
        val contest = updateContestUseCase.forceEnd(contestId)
        return ResponseEntity.ok().body(contest.toMetadataDTO())
    }

    @DeleteMapping("/{contestId}")
    @Private(Member.Type.ROOT)
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
        deleteContestUseCase.delete(contestId)
        return ResponseEntity.noContent().build()
    }
}
