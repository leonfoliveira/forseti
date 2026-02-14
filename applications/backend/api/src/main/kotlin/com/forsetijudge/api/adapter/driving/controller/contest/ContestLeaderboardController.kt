package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.dto.response.ErrorResponseDTO
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
class ContestLeaderboardController(
    val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/contests/{contestId}/leaderboard")
    @Operation(summary = "Build contest leaderboard by id")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Contest leaderboard found successfully"),
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
    fun build(
        @PathVariable contestId: UUID,
    ): ResponseEntity<LeaderboardOutputDTO> {
        logger.info("[GET] /v1/contests/$contestId/leaderboard")
        val member = RequestContext.getContext().session?.member
        val leaderboard = buildLeaderboardUseCase.build(contestId, member?.id)
        return ResponseEntity.ok(leaderboard)
    }
}
