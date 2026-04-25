package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildLeaderboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildLeaderboardUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: BuildLeaderboardUseCase.Command): LeaderboardResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Building leaderboard for contest with id: $contextContestId")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id: $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest, shouldBypassFreeze = command.bypassFreeze)

        return leaderboard.toResponseBodyDTO()
    }
}
