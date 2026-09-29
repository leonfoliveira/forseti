package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildLeaderboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildLeaderboardUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Builds the leaderboard for a specific contest.
     *
     * @return The result of building the leaderboard.
     */
    @Transactional(readOnly = true)
    override fun execute(command: BuildLeaderboardUseCase.Command): LeaderboardResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Building leaderboard for contest with id: ${command.contestId}")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest)

        return leaderboard.toResponseBodyDTO()
    }
}
