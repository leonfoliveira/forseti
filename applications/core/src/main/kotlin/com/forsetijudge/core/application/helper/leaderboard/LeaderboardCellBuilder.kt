package com.forsetijudge.core.application.helper.leaderboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.util.SafeLogger
import java.time.Duration
import org.springframework.stereotype.Service

@Service
class LeaderboardCellBuilder {
    private val logger = SafeLogger(this::class)

    companion object {
        private const val WRONG_SUBMISSION_PENALTY_MINUTES = 20
    }

    /**
     * Builds a leaderboard cell for a given problem and member based on their submissions.
     *
     * @param contest The contest in which the problem was attempted.
     * @param member The member who attempted the problem.
     * @param problem The problem for which the leaderboard cell is being built.
     * @param submissions The list of submissions made by the member for the problem.
     * @return A Leaderboard.Cell object containing the relevant information for the leaderboard.
     */
    fun build(
        contest: Contest,
        member: Member,
        problem: Problem,
        submissions: List<Submission>,
    ): Leaderboard.Cell {
        logger.info("Building leaderboard cell for problem with id: ${problem.id}")

        val sortedSubmissions = submissions.sortedBy { it.createdAt }

        val firstAcceptedSubmission =
            sortedSubmissions
                .firstOrNull { it.answer == Submission.Answer.ACCEPTED }
        val wrongSubmissionsBeforeAccepted =
            sortedSubmissions
                .takeWhile { it.answer != Submission.Answer.ACCEPTED }

        val isAccepted = firstAcceptedSubmission != null

        // If the problem was not accepted, no penalty is counted, even if there were wrong submissions
        val acceptationPenalty =
            if (isAccepted) {
                Duration.between(contest.startAt, firstAcceptedSubmission.createdAt).toMinutes().toInt()
            } else {
                0
            }
        // Same here, only count wrong submissions if the problem was eventually accepted
        val wrongAnswersPenalty =
            if (isAccepted) {
                wrongSubmissionsBeforeAccepted.size * WRONG_SUBMISSION_PENALTY_MINUTES
            } else {
                0
            }

        return Leaderboard.Cell(
            memberId = member.id,
            problemId = problem.id,
            problemLetter = problem.letter,
            problemColor = problem.color,
            isAccepted = isAccepted,
            acceptedAt = if (isAccepted) firstAcceptedSubmission.createdAt else null,
            wrongSubmissions = wrongSubmissionsBeforeAccepted.size,
            penalty = acceptationPenalty + wrongAnswersPenalty,
        )
    }
}
