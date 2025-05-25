package io.leonfoliveira.judge.core.service.problem

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.service.dto.output.ProblemMemberOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.ProblemOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import org.springframework.stereotype.Service

@Service
class FindProblemService(
    private val problemRepository: ProblemRepository,
    private val contestRepository: ContestRepository,
) {
    fun findById(id: Int): ProblemOutputDTO {
        val problem =
            problemRepository.findById(id).orElseThrow {
                NotFoundException("Could not find problem with id = $id")
            }
        if (!problem.contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }

        return problem.toOutputDTO()
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
    ): List<ProblemMemberOutputDTO> {
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

            ProblemMemberOutputDTO(
                id = problem.id,
                title = problem.title,
                descriptionKey = problem.description.key,
                isAccepted = isAccepted,
                wrongSubmissions = wrongSubmissionsBeforeAccepted.count(),
            )
        }
    }
}
