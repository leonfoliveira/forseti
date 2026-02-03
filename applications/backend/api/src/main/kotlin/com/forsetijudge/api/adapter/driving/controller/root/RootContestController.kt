package com.forsetijudge.api.adapter.driving.controller.root

import com.forsetijudge.api.adapter.dto.response.ErrorResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.ContestFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.ContestMetadataResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.toMetadataDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.driving.usecase.contest.FindContestUseCase
import com.forsetijudge.core.port.dto.input.contest.CreateContestInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class RootContestController(
    private val createContestUseCase: CreateContestUseCase,
    private val findContestUseCase: FindContestUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/root/contests")
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
        logger.info("[POST] /v1/root/contests $body")
        val contest = createContestUseCase.create(body)
        return ResponseEntity.ok(contest.toFullResponseDTO())
    }

    @GetMapping("/root/contests/metadata")
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
    fun findAllMetadata(): ResponseEntity<List<ContestMetadataResponseDTO>> {
        logger.info("[GET] /v1/root/contests/metadata")
        val contests = findContestUseCase.findAll()
        return ResponseEntity.ok(contests.map { it.toMetadataDTO() })
    }
}
