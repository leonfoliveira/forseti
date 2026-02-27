package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class BuildLeaderboardCellService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val buildLeaderboardCellInternalUseCase: BuildLeaderboardCellInternalUseCase,
) : BuildLeaderboardCellUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: BuildLeaderboardCellUseCase.Command): Pair<Leaderboard.Cell, UUID> {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info(
            "Building leaderboard cell for contest with id: $contextContestId, memberId: ${command.memberId} " +
                "and problemId: ${command.problemId}",
        )

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id = $contextContestId")
        val contextMember =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, contextMember)
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

        val internalCommand =
            BuildLeaderboardCellInternalUseCase.Command(
                contest = contest,
                member = member,
                problem = problem,
                submissions = submissions,
            )
        val cell = buildLeaderboardCellInternalUseCase.execute(internalCommand)

        logger.info("Leaderboard cell built successfully")
        return cell to member.id
    }
}
