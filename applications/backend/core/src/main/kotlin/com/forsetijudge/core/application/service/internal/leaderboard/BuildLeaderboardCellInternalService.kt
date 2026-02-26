package com.forsetijudge.core.application.service.internal.leaderboard

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class BuildLeaderboardCellInternalService : BuildLeaderboardCellInternalUseCase {
    private val logger = SafeLogger(this::class)

    companion object {
        private const val WRONG_SUBMISSION_PENALTY_MINUTES = 20
    }

    override fun execute(command: BuildLeaderboardCellInternalUseCase.Command): Leaderboard.Cell {
        logger.info("Building leaderboard cell for problem with id: ${command.problem.id}")

        val sortedSubmissions = command.submissions.sortedBy { it.createdAt }

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
                Duration.between(command.contest.startAt, firstAcceptedSubmission.createdAt).toMinutes().toInt()
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
            problemId = command.problem.id,
            problemLetter = command.problem.letter,
            problemColor = command.problem.color,
            isAccepted = isAccepted,
            acceptedAt = if (isAccepted) firstAcceptedSubmission.createdAt else null,
            wrongSubmissions = wrongSubmissionsBeforeAccepted.size,
            penalty = acceptationPenalty + wrongAnswersPenalty,
        )
    }
}
