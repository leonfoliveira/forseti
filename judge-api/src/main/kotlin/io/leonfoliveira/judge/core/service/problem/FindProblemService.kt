package io.leonfoliveira.judge.core.service.problem

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.service.dto.output.ProblemWithStatusOutputDTO
import org.springframework.stereotype.Service

@Service
class FindProblemService(
    private val problemRepository: ProblemRepository,
    private val contestRepository: ContestRepository,
) {
    fun findById(id: Int): Problem {
        val problem =
            problemRepository.findById(id).orElseThrow {
                NotFoundException("Could not find problem with id = $id")
            }
        if (!problem.contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }

        return problem
    }

    fun findAllByContest(contestId: Int): List<Problem> {
        val contest =
            contestRepository.findById(contestId)
                .orElseThrow { NotFoundException("Could not find contest with id = $contestId") }
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }
        return contest.problems
    }

    fun findAllByContestForMember(
        contestId: Int,
        memberId: Int,
    ): List<ProblemWithStatusOutputDTO> {
        val problems = findAllByContest(contestId)

        return problems.map { problem ->
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
    }
}
