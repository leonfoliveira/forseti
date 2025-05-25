package io.leonfoliveira.judge.core.service.leaderboard

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTO
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class LeaderboardService(
    private val contestRepository: ContestRepository,
) {
    companion object {
        private const val WRONG_SUBMISSION_PENALTY = 1200 // 20 minutes
    }

    fun buildLeaderboard(contestId: Int): LeaderboardOutputDTO {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }

        val problems =
            contest.problems.map {
                LeaderboardOutputDTO.ProblemDTO(
                    id = it.id,
                    title = it.title,
                )
            }

        val members =
            contest.members.map {
                buildMemberDTO(contest, it)
            }.sortedWith(compareBy({ -it.score }, { it.penalty }, { it.name }))

        return LeaderboardOutputDTO(
            contest =
                LeaderboardOutputDTO.ContestDTO(
                    id = contest.id,
                    title = contest.title,
                    startAt = contest.startAt,
                    endAt = contest.endAt,
                ),
            problems = problems,
            members = members,
        )
    }

    private fun buildMemberDTO(
        contest: Contest,
        member: Member,
    ): LeaderboardOutputDTO.MemberDTO {
        val submissionProblemHash = member.submissions.groupBy { it.problem.id }
        val problemDTOs =
            contest.problems.map {
                buildMemberProblemDTO(contest, it, submissionProblemHash[it.id] ?: emptyList())
            }
        val score = problemDTOs.filter { it.isAccepted }.size
        val penalty = problemDTOs.sumOf { it.penalty }

        return LeaderboardOutputDTO.MemberDTO(
            id = member.id,
            name = member.name,
            problems = problemDTOs,
            score = score,
            penalty = penalty,
        )
    }

    private fun buildMemberProblemDTO(
        contest: Contest,
        problem: Problem,
        submissions: List<Submission>,
    ): LeaderboardOutputDTO.MemberDTO.MemberProblemDTO {
        val firstAcceptedSubmission =
            submissions
                .firstOrNull { it.status == Submission.Status.ACCEPTED }
        val wrongSubmissionsBeforeAccepted =
            submissions
                .takeWhile { it.status != Submission.Status.ACCEPTED }

        val isAccepted = firstAcceptedSubmission != null

        val acceptationPenalty =
            if (isAccepted) {
                Duration.between(contest.startAt, firstAcceptedSubmission.createdAt).toSeconds().toInt()
            } else {
                0
            }
        val wrongAnswersPenalty =
            if (isAccepted) {
                wrongSubmissionsBeforeAccepted.size * WRONG_SUBMISSION_PENALTY
            } else {
                0
            }

        return LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
            id = problem.id,
            wrongSubmissions = wrongSubmissionsBeforeAccepted.size,
            isAccepted = isAccepted,
            penalty = acceptationPenalty + wrongAnswersPenalty,
        )
    }
}
