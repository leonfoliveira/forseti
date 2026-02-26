package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration

@Service
class BuildLeaderboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val buildLeaderboardCellInternalUseCase: BuildLeaderboardCellInternalUseCase,
) : BuildLeaderboardUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(): Leaderboard {
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

        val contestants = memberRepository.findAllByContestIdAndType(contestId = contextContestId, Member.Type.CONTESTANT)

        val rows =
            contestants
                // Only contestants are considered for the leaderboard
                .filter { it.type == Member.Type.CONTESTANT }
                .map { buildRow(contest, it) }
                .sortedWith { a, b ->
                    if (a.score != b.score) {
                        return@sortedWith -a.score.compareTo(b.score)
                    }
                    if (a.penalty != b.penalty) {
                        return@sortedWith a.penalty.compareTo(b.penalty)
                    }

                    val aAcceptedTimes =
                        a.cells
                            .map { it.acceptedAt }
                            .filter { it != null }
                            .sortedByDescending { it }
                    val bAcceptedTimes =
                        b.cells
                            .map { it.acceptedAt }
                            .filter { it != null }
                            .sortedByDescending { it }

                    for (i in aAcceptedTimes.indices) {
                        val acceptedDiff = Duration.between(contest.startAt, aAcceptedTimes[i]).toMinutes().toInt()
                        val bAcceptedDiff = Duration.between(contest.startAt, bAcceptedTimes[i]).toMinutes().toInt()
                        if (acceptedDiff != bAcceptedDiff) {
                            return@sortedWith acceptedDiff.compareTo(bAcceptedDiff)
                        }
                    }

                    return@sortedWith a.memberName.compareTo(b.memberName)
                }

        return Leaderboard(
            contestId = contest.id,
            contestStartAt = contest.startAt,
            isFrozen = contest.isFrozen,
            rows = rows,
            issuedAt = ExecutionContext.Companion.get().startedAt,
        )
    }

    /**
     * Builds a Row for the leaderboard based on the member's submissions and the contest's problems.
     * If the contest is frozen, it uses the frozen submissions instead of the regular submissions.
     *
     * @param contest The contest
     * @param member The member
     * @return The Row for the leaderboard
     */
    private fun buildRow(
        contest: Contest,
        member: Member,
    ): Leaderboard.Row {
        val submissions =
            if (contest.isFrozen) {
                member.frozenSubmissions.map { it.unfreeze() }
            } else {
                member.submissions
            }

        val submissionProblemHash = submissions.groupBy { it.problem.id }
        val cells =
            contest.problems.map { problem ->
                buildLeaderboardCellInternalUseCase.execute(
                    BuildLeaderboardCellInternalUseCase.Command(
                        contest = contest,
                        problem = problem,
                        submissions =
                            submissionProblemHash[problem.id]
                                ?.filter { it.status == Submission.Status.JUDGED }
                                ?: emptyList(),
                    ),
                )
            }

        val score = cells.count { it.isAccepted }
        val penalty = cells.sumOf { it.penalty }

        return Leaderboard.Row(
            memberId = member.id,
            memberName = member.name,
            score = score,
            penalty = penalty,
            cells = cells,
        )
    }
}
