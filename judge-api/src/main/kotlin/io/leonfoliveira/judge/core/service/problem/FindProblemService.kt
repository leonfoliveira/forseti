package io.leonfoliveira.judge.core.service.problem

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
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
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }
        return contest.problems
    }
}
