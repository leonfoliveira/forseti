package io.leonfoliveira.judge.core.service.leaderboard

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTO
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.ZoneOffset

@Service
class LeaderboardService(
    private val contestRepository: ContestRepository,
) {
    companion object {
        private const val WRONG_SUBMISSION_PENALTY = 20
    }

    fun buildLeaderboard(contestId: Int): LeaderboardOutputDTO {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }

        val problems =
            contest.problems.map {
                LeaderboardOutputDTO.LeaderboardProblemOutputDTO(
                    id = it.id,
                    title = it.title,
                )
            }

        val members =
            contest.members.map {
                buildMemberBlock(it, contest.problems)
            }.sortedWith(compareBy({ -it.score }, { it.penalty }, { it.name }))

        return LeaderboardOutputDTO(
            contestId = contestId,
            problems = problems,
            members = members,
        )
    }

    private fun buildMemberBlock(
        member: Member,
        problems: List<Problem>,
    ): LeaderboardOutputDTO.LeaderboardMemberOutputDTO {
        val problems =
            problems.map {
                buildMemberProblemBlock(member, it.id)
            }
        val score = problems.filter { it.isAccepted }.size
        val penalty = problems.sumOf { it.penalty }
        return LeaderboardOutputDTO.LeaderboardMemberOutputDTO(
            id = member.id,
            name = member.name,
            problems =
                problems.map {
                    buildMemberProblemBlock(member, it.id)
                },
            score = score,
            penalty = penalty,
        )
    }

    private fun buildMemberProblemBlock(
        member: Member,
        problemId: Int,
    ): LeaderboardOutputDTO.LeaderboardMemberOutputDTO.LeaderboardMemberProblemOutputDTO {
        val submissionsToProblem =
            member.submissions
                .filter { it.problem.id == problemId }
                .filter { it.status != Submission.Status.JUDGING }
                .sortedBy { it.createdAt }

        val firstAcceptedSubmission =
            submissionsToProblem
                .firstOrNull { it.status == Submission.Status.ACCEPTED }
        val wrongSubmissions =
            submissionsToProblem
                .takeWhile { it.status != Submission.Status.ACCEPTED }

        val acceptedPenalty =
            firstAcceptedSubmission?.let {
                Duration.between(
                    it.createdAt.toInstant(ZoneOffset.UTC),
                    TimeUtils.now().toInstant(ZoneOffset.UTC),
                ).toMinutes().toInt()
            } ?: 0
        val isAccepted = firstAcceptedSubmission != null
        val wrongsPenalty = if (isAccepted) wrongSubmissions.size * WRONG_SUBMISSION_PENALTY else 0

        return LeaderboardOutputDTO.LeaderboardMemberOutputDTO.LeaderboardMemberProblemOutputDTO(
            id = problemId,
            wrongSubmissions = wrongSubmissions.size,
            isAccepted = isAccepted,
            penalty = acceptedPenalty + wrongsPenalty,
        )
    }
}
