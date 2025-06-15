package io.github.leonfoliveira.judge.core.service.contest

import io.github.leonfoliveira.judge.core.domain.entity.Contest
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.domain.entity.Problem
import io.github.leonfoliveira.judge.core.domain.entity.Submission
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.repository.ContestRepository
import io.github.leonfoliveira.judge.core.service.dto.output.ContestLeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID

@Service
class FindContestService(
    private val contestRepository: ContestRepository,
) {
    companion object {
        private const val WRONG_SUBMISSION_PENALTY = 1200 // 20 minutes
    }

    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findAll(): List<Contest> {
        logger.info("Finding all contests")
        val contests = contestRepository.findAll().toList()
        logger.info("Found ${contests.size} contests")
        return contests
    }

    fun findById(id: UUID): Contest {
        logger.info("Finding contest with id: $id")
        val contest =
            contestRepository.findById(id).orElseThrow {
                NotFoundException("Could not find contest with id = $id")
            }
        logger.info("Found contest by id")
        return contest
    }

    fun findBySlug(slug: String): Contest {
        logger.info("Finding contest with slug: $slug")
        val contest =
            contestRepository.findBySlug(slug)
                ?: throw NotFoundException("Could not find contest with slug = $slug")
        logger.info("Found contest by slug")
        return contest
    }

    fun buildContestLeaderboard(contest: Contest): ContestLeaderboardOutputDTO {
        logger.info("Building outputDTO for contest with id: ${contest.id}")

        val classification =
            contest.members
                .filter { it.type == Member.Type.CONTESTANT }
                .map { buildMemberDTO(contest, it) }
                .sortedWith { a, b ->
                    if (a.score != b.score) {
                        return@sortedWith -a.score.compareTo(b.score)
                    }
                    if (a.penalty != b.penalty) {
                        return@sortedWith a.penalty.compareTo(b.penalty)
                    }

                    val aAcceptedTimes = a.problems.map { it.acceptedAt }.filter { it !== null }.sortedByDescending { it }
                    val bAcceptedTimes = b.problems.map { it.acceptedAt }.filter { it !== null }.sortedByDescending { it }

                    for (i in aAcceptedTimes.indices) {
                        if (aAcceptedTimes[i] != bAcceptedTimes[i]) {
                            return@sortedWith aAcceptedTimes[i]!!.compareTo(bAcceptedTimes[i])
                        }
                    }

                    return@sortedWith a.name.compareTo(b.name)
                }

        return ContestLeaderboardOutputDTO(
            contestId = contest.id,
            slug = contest.slug,
            startAt = contest.startAt,
            classification = classification,
            issuedAt = OffsetDateTime.now(),
        )
    }

    private fun buildMemberDTO(
        contest: Contest,
        member: Member,
    ): ContestLeaderboardOutputDTO.MemberDTO {
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

        return ContestLeaderboardOutputDTO.MemberDTO(
            memberId = member.id,
            name = member.name,
            score = score,
            penalty = penalty,
            problems = problemDTOs,
        )
    }

    private fun buildProblemDTO(
        contest: Contest,
        problem: Problem,
        submissions: List<Submission>,
    ): ContestLeaderboardOutputDTO.ProblemDTO {
        val firstAcceptedSubmission =
            submissions
                .firstOrNull { it.answer == Submission.Answer.ACCEPTED }
        val wrongSubmissionsBeforeAccepted =
            submissions
                .takeWhile { it.answer != Submission.Answer.ACCEPTED }

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

        return ContestLeaderboardOutputDTO.ProblemDTO(
            problemId = problem.id,
            letter = problem.letter,
            isAccepted = isAccepted,
            acceptedAt = if (isAccepted) firstAcceptedSubmission.createdAt else null,
            wrongSubmissions = wrongSubmissionsBeforeAccepted.size,
            penalty = acceptationPenalty + wrongAnswersPenalty,
        )
    }
}
