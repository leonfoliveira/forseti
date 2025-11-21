package live.forseti.api.adapter.driving.controller.contest

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.api.adapter.dto.response.ErrorResponseDTO
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import live.forseti.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import live.forseti.core.port.dto.output.LeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests/{contestId}/leaderboard")
class ContestLeaderboardController(
    val authorizeContestUseCase: AuthorizeContestUseCase,
    val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping
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
    fun buildContestLeaderboardById(
        @PathVariable contestId: UUID,
    ): ResponseEntity<LeaderboardOutputDTO> {
        logger.info("[GET] /v1/contests/$contestId/leaderboard")
        authorizeContestUseCase.checkIfStarted(contestId)
        val leaderboard = buildLeaderboardUseCase.build(contestId)
        return ResponseEntity.ok(leaderboard)
    }
}
