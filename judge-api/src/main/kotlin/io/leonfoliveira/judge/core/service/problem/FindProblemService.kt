package io.leonfoliveira.judge.core.service.problem

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.dto.output.ProblemMemberOutputDTO
import org.springframework.stereotype.Service

@Service
class FindProblemService(
    private val problemRepository: ProblemRepository,
    private val findContestService: FindContestService,
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
        val contest = findContestService.findById(contestId)
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }
        return contest.problems
    }

    fun findAllByContestForMember(
        contestId: Int,
        memberId: Int,
    ): List<ProblemMemberOutputDTO> {
        val problems = findAllByContest(contestId)

        return problems.map { problem ->
            val memberSubmissions =
                problem.submissions
                    .filter { it.member.id == memberId }
                    .filter { it.status != Submission.Status.JUDGING }

            ProblemMemberOutputDTO(
                id = problem.id,
                title = problem.title,
                wrongAnswers =
                    memberSubmissions
                        .count { it.status != Submission.Status.ACCEPTED },
                acceptedAnswers =
                    memberSubmissions
                        .count { it.status == Submission.Status.ACCEPTED },
            )
        }
    }
}
