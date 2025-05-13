package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
import org.springframework.stereotype.Service

@Service
class CreateContestService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val bucketAdapter: BucketAdapter,
) {
    fun create(inputDTO: CreateContestInputDTO): Contest {
        val contest =
            Contest(
                title = inputDTO.title,
                languages = inputDTO.languages,
                startAt = inputDTO.startAt,
                endAt = inputDTO.endAt,
            )

        contest.members = inputDTO.members.map { createMember(contest, it) }
        contest.problems = inputDTO.problems.map { createProblem(contest, it) }

        return contestRepository.save(contest)
    }

    private fun createMember(
        contest: Contest,
        memberDTO: CreateContestInputDTO.MemberDTO,
    ): Member {
        val hashedPassword = hashAdapter.hash(memberDTO.password)
        val member =
            Member(
                type = memberDTO.type,
                name = memberDTO.name,
                login = memberDTO.login,
                password = hashedPassword,
                contest = contest,
            )

        return member
    }

    private fun createProblem(
        contest: Contest,
        problemDTO: CreateContestInputDTO.ProblemDTO,
    ): Problem {
        val testCases = bucketAdapter.upload(problemDTO.testCases)
        val problem =
            Problem(
                title = problemDTO.title,
                description = problemDTO.description,
                timeLimit = problemDTO.timeLimit,
                testCases = testCases,
                contest = contest,
            )

        return problem
    }
}
