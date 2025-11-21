package live.forseti.core.application.service.leaderboard

import live.forseti.core.domain.entity.Contest
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.Problem
import live.forseti.core.domain.entity.Submission
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import live.forseti.core.port.dto.output.LeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID

@Service
class BuildLeaderboardService(
    private val contestRepository: ContestRepository,
) : BuildLeaderboardUseCase {
    companion object {
        private const val WRONG_SUBMISSION_PENALTY = 1200 // 20 minutes
    }

    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Builds the current leaderboard for a given contest. Order of criteria:
     * 1. Problems solved (higher is better)
     * 2. Penalty time (lower is better)
     *  2.1. Time from the start of the contest to the acceptance of each problem (seconds).
     *  2.2. 20 minutes for each wrong submission before their problem was accepted (milliseconds).
     * 3. Time of the first accepted submission, then second and so on (milliseconds, lower is better).
     * 4. Name (alphabetical order).
     *
     * @param contestId The id of the contest
     * @return The leaderboard output DTO
     * @throws NotFoundException If the contest is not found
     */
    @Transactional(readOnly = true)
    override fun build(contestId: UUID): LeaderboardOutputDTO {
        logger.info("Building outputDTO for contest with id: $contestId")
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")

        val classification =
            contest.members
                // Only contestants are considered for the leaderboard
                .filter { it.type == Member.Type.CONTESTANT }
                .map { buildMemberDTO(contest, it) }
                .sortedWith { a, b ->
                    if (a.score != b.score) {
                        return@sortedWith -a.score.compareTo(b.score)
                    }
                    if (a.penalty != b.penalty) {
                        return@sortedWith a.penalty.compareTo(b.penalty)
                    }

                    val aAcceptedTimes =
                        a.problems
                            .map { it.acceptedAt }
                            .filter { it !== null }
                            .sortedByDescending { it }
                    val bAcceptedTimes =
                        b.problems
                            .map { it.acceptedAt }
                            .filter { it !== null }
                            .sortedByDescending { it }

                    for (i in aAcceptedTimes.indices) {
                        if (aAcceptedTimes[i] != bAcceptedTimes[i]) {
                            return@sortedWith aAcceptedTimes[i]!!.compareTo(bAcceptedTimes[i])
                        }
                    }

                    // The precision from the previous comparisons makes it almost impossible to reach this point, but if we do, sort by name alphabetically.
                    return@sortedWith a.name.compareTo(b.name)
                }

        return LeaderboardOutputDTO(
            contestId = contest.id,
            slug = contest.slug,
            startAt = contest.startAt,
            members = classification,
            issuedAt = OffsetDateTime.now(),
        )
    }

    /**
     * Builds the score of a member in the leaderboard.
     *
     * @param contest The contest
     * @param member The member
     * @return The memberDTO for the leaderboard
     */
    private fun buildMemberDTO(
        contest: Contest,
        member: Member,
    ): LeaderboardOutputDTO.MemberDTO {
        val submissionProblemHash = member.submissions.groupBy { it.problem.id }
        val problemDTOs =
            contest.problems.map { problem ->
                buildProblemDTO(
                    contest,
                    problem,
                    submissionProblemHash[problem.id]
                        ?.filter { it.status === Submission.Status.JUDGED }
                        ?: emptyList(),
                )
            }
        val score = problemDTOs.filter { it.isAccepted }.size
        val penalty = problemDTOs.sumOf { it.penalty }

        return LeaderboardOutputDTO.MemberDTO(
            id = member.id,
            name = member.name,
            score = score,
            penalty = penalty,
            problems = problemDTOs,
        )
    }

    /**
     * Builds score of a member for a specific problem in the leaderboard.
     *
     * @param contest The contest
     * @param problem The problem
     * @param submissions The submissions of the member for the problem
     * @return The problemDTO for the leaderboard
     */
    private fun buildProblemDTO(
        contest: Contest,
        problem: Problem,
        submissions: List<Submission>,
    ): LeaderboardOutputDTO.ProblemDTO {
        val firstAcceptedSubmission =
            submissions
                .firstOrNull { it.answer == Submission.Answer.ACCEPTED }
        val wrongSubmissionsBeforeAccepted =
            submissions
                .takeWhile { it.answer != Submission.Answer.ACCEPTED }

        val isAccepted = firstAcceptedSubmission != null

        // If the problem was not accepted, no penalty is counted, even if there were wrong submissions
        val acceptationPenalty =
            if (isAccepted) {
                Duration.between(contest.startAt, firstAcceptedSubmission.createdAt).toSeconds().toInt()
            } else {
                0
            }
        // Same here, only count wrong submissions if the problem was eventually accepted
        val wrongAnswersPenalty =
            if (isAccepted) {
                wrongSubmissionsBeforeAccepted.size * WRONG_SUBMISSION_PENALTY
            } else {
                0
            }

        return LeaderboardOutputDTO.ProblemDTO(
            id = problem.id,
            letter = problem.letter,
            isAccepted = isAccepted,
            acceptedAt = if (isAccepted) firstAcceptedSubmission.createdAt else null,
            wrongSubmissions = wrongSubmissionsBeforeAccepted.size,
            penalty = acceptationPenalty + wrongAnswersPenalty,
        )
    }
}
