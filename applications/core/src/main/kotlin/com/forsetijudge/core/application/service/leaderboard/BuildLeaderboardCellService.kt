package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardCellResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildLeaderboardCellService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val leaderboardCellBuilder: LeaderboardCellBuilder,
) : BuildLeaderboardCellUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Builds a cell for the leaderboard based on the given member and problem.
     *
     * @param command The command containing the member and problem to build the cell for.
     * @return A pair containing the built leaderboard cell and the ID of the member for whom the cell was built.
     */
    @Transactional(readOnly = true)
    override fun execute(command: BuildLeaderboardCellUseCase.Command): LeaderboardCellResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info(
            "Building leaderboard cell for contest with id: ${command.contestId}, memberId: ${command.memberId} " +
                "and problemId: ${command.problemId}",
        )

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = ${command.contestId}")
        val contextMember =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, contextMember)
            .requireMemberToBelong()
            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
            .throwIfErrors()

        val member =
            memberRepository.findByIdAndContestId(command.memberId, contest.id)
                ?: throw NotFoundException("Could not find member with id = ${command.memberId} in this contest")
        val problem =
            problemRepository.findByIdAndContestId(command.problemId, contest.id)
                ?: throw NotFoundException("Could not find problem with id = ${command.problemId} in this contest")
        val submissions =
            submissionRepository.findAllByMemberIdAndProblemIdAndStatus(
                memberId = command.memberId,
                problemId = command.problemId,
                status = Submission.Status.JUDGED,
            )

        val cell =
            leaderboardCellBuilder.build(
                contest = contest,
                member = member,
                problem = problem,
                submissions = submissions,
            )

        logger.info("Leaderboard cell built successfully")
        return cell.toResponseBodyDTO()
    }
}
