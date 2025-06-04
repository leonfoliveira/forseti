package io.leonfoliveira.judge.core.service.problem

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.service.dto.output.ProblemWithStatusOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class FindProblemService(
    private val problemRepository: ProblemRepository,
    private val contestRepository: ContestRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findById(id: Int): Problem {
        logger.info("Finding problem with id: $id")

        val problem =
            problemRepository.findById(id).orElseThrow {
                NotFoundException("Could not find problem with id = $id")
            }
        if (!problem.contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }

        logger.info("Found problem")
        return problem
    }

    fun findAllByContest(contestId: Int): List<Problem> {
        logger.info("Finding all problems for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId)
                .orElseThrow { NotFoundException("Could not find contest with id = $contestId") }
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }

        logger.info("Found ${contest.problems.size} problems")
        return contest.problems
    }

    fun findAllByContestForMember(
        contestId: Int,
        memberId: Int,
    ): List<ProblemWithStatusOutputDTO> {
        logger.info("Finding all problems for contest with id: $contestId and member with id: $memberId")
        val problems = findAllByContest(contestId)

        val problemsForMember =
            problems.map { problem ->
                val memberSubmissions =
                    problem.submissions
                        .filter { it.member.id == memberId }
                        .filter { it.status != Submission.Status.JUDGING }

                val isAccepted =
                    memberSubmissions.any { it.status == Submission.Status.ACCEPTED }
                val wrongSubmissionsBeforeAccepted =
                    memberSubmissions
                        .takeWhile { it.status != Submission.Status.ACCEPTED }

                ProblemWithStatusOutputDTO(
                    id = problem.id,
                    title = problem.title,
                    description = problem.description,
                    isAccepted = isAccepted,
                    wrongSubmissions = wrongSubmissionsBeforeAccepted.count(),
                )
            }

        logger.info("Found ${problemsForMember.size} problems for member with id: $memberId")
        return problemsForMember
    }
}
