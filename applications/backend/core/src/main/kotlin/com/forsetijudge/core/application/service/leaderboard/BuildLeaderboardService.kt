package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.util.AuthorizationUtil
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import com.forsetijudge.core.port.dto.output.LeaderboardPartialOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID

@Service
class BuildLeaderboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
) : BuildLeaderboardUseCase {
    companion object {
        private const val WRONG_SUBMISSION_PENALTY_MINUTES = 20
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
     * @param memberId The id of the member requesting the leaderboard
     * @return The leaderboard output DTO
     * @throws NotFoundException If the contest is not found
     * @throws ForbiddenException If the contest has not started yet and the member is not an admin or root
     */
    @Transactional(readOnly = true)
    override fun build(
        contestId: UUID,
        memberId: UUID?,
    ): LeaderboardOutputDTO {
        logger.info("Building outputDTO for contest with id: $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")
        val member =
            memberId?.let {
                memberRepository.findEntityById(it)
                    ?: throw NotFoundException("Could not find member with id = $it")
            }

        AuthorizationUtil.checkContestStarted(contest, member)

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
                        val acceptedDiff = Duration.between(contest.startAt, aAcceptedTimes[i]).toMinutes().toInt()
                        val bAcceptedDiff = Duration.between(contest.startAt, bAcceptedTimes[i]).toMinutes().toInt()
                        if (acceptedDiff != bAcceptedDiff) {
                            return@sortedWith acceptedDiff.compareTo(bAcceptedDiff)
                        }
                    }

                    return@sortedWith a.name.compareTo(b.name)
                }

        return LeaderboardOutputDTO(
            contestId = contest.id,
            isFrozen = contest.isFrozen(),
            slug = contest.slug,
            startAt = contest.startAt,
            members = classification,
            issuedAt = OffsetDateTime.now(),
        )
    }

    /**
     * Finds the cell of the leaderboard for a specific submission member and problem.
     *
     * @param memberUUID The ID of the member to get the leaderboard cell for.
     * @param problemUUID The ID of the problem to get the leaderboard cell for.
     * @return The partial leaderboard data for the submission.
     */
    override fun buildPartial(
        memberUUID: UUID,
        problemUUID: UUID,
    ): LeaderboardPartialOutputDTO {
        val problem =
            problemRepository.findEntityById(problemUUID)
                ?: throw NotFoundException("Could not find problem with id = $problemUUID")
        val submissions = submissionRepository.findAllByMemberIdAndProblemIdAndStatus(memberUUID, problemUUID, Submission.Status.JUDGED)

        val problemDTO = buildProblemDTO(problem.contest, problem, submissions)
        return LeaderboardPartialOutputDTO(
            memberId = memberUUID,
            problemId = problemUUID,
            letter = problem.letter,
            isAccepted = problemDTO.isAccepted,
            acceptedAt = problemDTO.acceptedAt,
            wrongSubmissions = problemDTO.wrongSubmissions,
            penalty = problemDTO.penalty,
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
