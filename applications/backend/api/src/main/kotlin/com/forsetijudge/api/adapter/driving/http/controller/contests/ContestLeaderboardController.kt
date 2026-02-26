package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.UnfreezeLeaderboardUseCase
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestLeaderboardController(
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
    private val unfreezeLeaderboardUseCase: UnfreezeLeaderboardUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PutMapping("/contests/{contestId}/leaderboard:freeze")
    fun freeze(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId/leaderboard:freeze")
        val contest = freezeLeaderboardUseCase.execute()
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}/leaderboard:unfreeze")
    fun unfreeze(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId/leaderboard:unfreeze")
        val contest = unfreezeLeaderboardUseCase.execute()
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }
}
