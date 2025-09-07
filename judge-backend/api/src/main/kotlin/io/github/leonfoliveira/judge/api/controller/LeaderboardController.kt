package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.service.dto.output.LeaderboardOutputDTO
import io.github.leonfoliveira.judge.common.service.leaderboard.FindLeaderboardService
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
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests/{contestId}/leaderboard")
class LeaderboardController(
    val contestAuthFilter: ContestAuthFilter,
    val findLeaderboardService: FindLeaderboardService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping
    @RateLimit
    @Transactional(readOnly = true)
    @Operation(summary = "Find contest leaderboard by id")
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
    fun findContestLeaderboardById(
        @PathVariable contestId: UUID,
    ): ResponseEntity<LeaderboardOutputDTO> {
        logger.info("[GET] /v1/contests/$contestId/leaderboard")
        contestAuthFilter.checkIfStarted(contestId)
        val leaderboard = findLeaderboardService.findByContestId(contestId)
        return ResponseEntity.ok(leaderboard)
    }
}
