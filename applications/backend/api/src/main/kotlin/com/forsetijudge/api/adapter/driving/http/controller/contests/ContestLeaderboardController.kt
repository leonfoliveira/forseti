package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.UnfreezeLeaderboardUseCase
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestLeaderboardController(
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
    private val unfreezeLeaderboardUseCase: UnfreezeLeaderboardUseCase,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/contests/{contestId}/leaderboard")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun get(): ResponseEntity<LeaderboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/{contestId}/leaderboard")
        val leaderboard =
            buildLeaderboardUseCase.execute(
                BuildLeaderboardUseCase.Command(bypassFreeze = true),
            )
        return ResponseEntity.ok(leaderboard.toResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}/leaderboard:freeze")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun freeze(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId/leaderboard:freeze")
        val contest = freezeLeaderboardUseCase.execute()
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}/leaderboard:unfreeze")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun unfreeze(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestWithMembersAndProblemsResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId/leaderboard:unfreeze")
        val contest = unfreezeLeaderboardUseCase.execute()
        return ResponseEntity.ok(contest.toWithMembersAndProblemsResponseBodyDTO())
    }
}
