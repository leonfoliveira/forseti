package io.leonfoliveira.judge.core.service.problem

import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import org.springframework.stereotype.Service

@Service
class FindProblemService(
    private val problemRepository: ProblemRepository,
    private val contestRepository: ContestRepository,
) {
    fun findById(id: Int): Problem {
        return problemRepository.findById(id).orElseThrow {
            NotFoundException("Could not find problem with id = $id")
        }
    }

    fun findAllByContest(contestId: Int): List<Problem> {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        return contest.problems
    }
}
