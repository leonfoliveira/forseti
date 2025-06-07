package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.output.ContestOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Duration
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
        logger.info("Found contest")
        return contest
    }

    fun buildOutputDTO(contestId: UUID): ContestOutputDTO {
        logger.info("Building outputDTO for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }

        val members =
            contest.members.map {
                buildMemberDTO(contest, it)
            }.sortedWith(compareBy({ -it.score }, { it.penalty }, { it.name }))
        val problems = contest.problems.map { buildProblemDTO(it) }.sortedBy { it.title }

        return ContestOutputDTO(
            id = contest.id,
            title = contest.title,
            languages = contest.languages,
            startAt = contest.startAt,
            endAt = contest.endAt,
            members = members,
            problems = problems,
        )
    }

    private fun buildMemberDTO(
        contest: Contest,
        member: Member,
    ): ContestOutputDTO.MemberDTO {
        val submissionProblemHash = member.submissions.groupBy { it.problem.id }
        val problemDTOs =
            contest.problems.map {
                buildMemberProblemDTO(contest, it, submissionProblemHash[it.id] ?: emptyList())
            }
        val score = problemDTOs.filter { it.isAccepted }.size
        val penalty = problemDTOs.sumOf { it.penalty }

        return ContestOutputDTO.MemberDTO(
            id = member.id,
            type = member.type.name,
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
    ): ContestOutputDTO.MemberDTO.MemberProblemDTO {
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

        return ContestOutputDTO.MemberDTO.MemberProblemDTO(
            problemId = problem.id,
            wrongSubmissions = wrongSubmissionsBeforeAccepted.size,
            isAccepted = isAccepted,
            penalty = acceptationPenalty + wrongAnswersPenalty,
        )
    }

    private fun buildProblemDTO(problem: Problem): ContestOutputDTO.ProblemDTO {
        return ContestOutputDTO.ProblemDTO(
            id = problem.id,
            title = problem.title,
            description = problem.description,
        )
    }
}
