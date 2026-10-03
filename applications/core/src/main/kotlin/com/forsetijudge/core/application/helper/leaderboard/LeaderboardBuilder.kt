package com.forsetijudge.core.application.helper.leaderboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.output.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class LeaderboardBuilder(
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val leaderboardCellBuilder: LeaderboardCellBuilder,
    private val leaderboardCacheStore: LeaderboardCacheStore,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Builds the leaderboard for a specific contest.
     *
     * @param contest the contest for which the leaderboard is being built
     * @return the leaderboard for the contest
     */
    fun build(contest: Contest): Leaderboard {
        logger.info("Building leaderboard for contest with id: ${contest.id}")

        val contestants =
            memberRepository.findAllByContestIdAndTypeIn(
                contest.id,
                listOf(Member.Type.CONTESTANT),
            )
        val problems = contest.problems

        val rows =
            buildRows(contest, contestants, problems)
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
            rows = rows,
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
        contest: Contest,
        members: List<Member>,
        problems: List<Problem>,
    ): List<Leaderboard.Row> {
        val cells = buildCells(contest, members, problems)
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
        contest: Contest,
        members: List<Member>,
        problems: List<Problem>,
    ): List<Leaderboard.Cell> {
        val cachedCells =
            leaderboardCacheStore.getAllCellsByContestId(contest.id).groupBy {
                it.memberId to
                    it.problemId
            }

        val submissionsForNonCachedMemberProblemPairs =
            submissionRepository
                .findByContestIdAndStatusAndMemberAndProblemPairsNotIn(
                    contestId = contest.id,
                    status = Submission.Status.JUDGED,
                    excludedPairs = cachedCells.keys.map { "${it.first}:${it.second}" },
                ).groupBy { it.member.id to it.problem.id }

        val cells =
            members.flatMap { member ->
                problems.map { problem ->
                    cachedCells[member.id to problem.id]?.first()
                        ?: leaderboardCellBuilder.build(
                            contest = contest,
                            member = member,
                            problem = problem,
                            submissions =
                                submissionsForNonCachedMemberProblemPairs[member.id to problem.id]
                                    ?: emptyList(),
                        )
                }
            }

        return cells
    }
}
