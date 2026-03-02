package com.forsetijudge.core.application.service.internal.leaderboard

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardInternalUseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration

@Service
class BuildLeaderboardInternalService(
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val buildLeaderboardCellInternalUseCase: BuildLeaderboardCellInternalUseCase,
    private val leaderboardCacheStore: LeaderboardCacheStore,
) : BuildLeaderboardInternalUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(command: BuildLeaderboardInternalUseCase.Command): Leaderboard {
        logger.info("Building leaderboard for contest with id: ${command.contest.id}, bypassFreeze: ${command.bypassFreeze}")

        val contestants =
            memberRepository.findAllByContestIdAndTypeIn(
                command.contest.id,
                listOf(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT),
            )
        val problems = command.contest.problems

        val rows =
            buildRows(command, command.contest, contestants, problems)
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
                        val acceptedDiff = Duration.between(command.contest.startAt, aAcceptedTimes[i]).toMinutes().toInt()
                        val bAcceptedDiff = Duration.between(command.contest.startAt, bAcceptedTimes[i]).toMinutes().toInt()
                        if (acceptedDiff != bAcceptedDiff) {
                            return@sortedWith acceptedDiff.compareTo(bAcceptedDiff)
                        }
                    }

                    return@sortedWith a.memberName.compareTo(b.memberName)
                }

        return Leaderboard(
            contestId = command.contest.id,
            contestStartAt = command.contest.startAt,
            isFrozen = command.contest.isFrozen,
            rows = rows,
            issuedAt = ExecutionContext.Companion.get().startedAt,
        )
    }

    /**
     * Builds the rows of the leaderboard, one for each contestant. Each row contains the score, penalty and cells of the contestant.
     *
     * @param contest the contest for which the leaderboard is being built
     * @param members the list of contestants participating in the contest
     * @param problems the list of problems in the contest
     */
    private fun buildRows(
        command: BuildLeaderboardInternalUseCase.Command,
        contest: Contest,
        members: List<Member>,
        problems: List<Problem>,
    ): List<Leaderboard.Row> {
        val cells = buildCells(command, contest, members, problems)
        val cellsByMemberId = cells.groupBy { it.memberId }

        val rows =
            members.map { member ->
                val memberCells = cellsByMemberId[member.id].orEmpty()

                val score = memberCells.count { it.isAccepted }
                val penalty = memberCells.sumOf { it.penalty }

                Leaderboard.Row(
                    memberId = member.id,
                    memberName = member.name,
                    memberType = member.type,
                    score = score,
                    penalty = penalty,
                    cells = memberCells.sortedBy { it.problemLetter },
                )
            }

        return rows
    }

    /**
     * Builds the cells of the leaderboard, one for each contestant and problem.
     *
     * @param contest the contest for which the leaderboard is being built
     * @param members the list of contestants participating in the contest
     * @param problems the list of problems in the contest
     */
    private fun buildCells(
        command: BuildLeaderboardInternalUseCase.Command,
        contest: Contest,
        members: List<Member>,
        problems: List<Problem>,
    ): List<Leaderboard.Cell> {
        val cachedCells =
            if (command.bypassFreeze) {
                emptyMap()
            } else {
                leaderboardCacheStore.getAllCellsByContestId(contest.id).groupBy {
                    it.memberId to
                        it.problemId
                }
            }

        val submissionsForNonCachedMemberProblemPairs =
            if (contest.isFrozen && !command.bypassFreeze) {
                frozenSubmissionRepository
                    .findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
                        contestId = contest.id,
                        status = Submission.Status.JUDGED,
                        excludedPairs = cachedCells.keys.map { "${it.first}:${it.second}" },
                    ).map { it.unfreeze() }
            } else {
                submissionRepository
                    .findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
                        contestId = contest.id,
                        status = Submission.Status.JUDGED,
                        excludedPairs = cachedCells.keys.map { "${it.first}:${it.second}" },
                    )
            }.groupBy { it.member.id to it.problem.id }

        val cells =
            members
                .map { member ->
                    problems.map { problem ->
                        cachedCells[member.id to problem.id]?.first()
                            ?: buildLeaderboardCellInternalUseCase.execute(
                                BuildLeaderboardCellInternalUseCase.Command(
                                    contest = contest,
                                    member = member,
                                    problem = problem,
                                    submissions = submissionsForNonCachedMemberProblemPairs[member.id to problem.id] ?: emptyList(),
                                ),
                            )
                    }
                }.flatten()

        return cells
    }
}
