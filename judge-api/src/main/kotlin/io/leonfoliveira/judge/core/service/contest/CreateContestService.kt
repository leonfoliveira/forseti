package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
import io.leonfoliveira.judge.core.service.dto.output.ContestOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val bucketAdapter: BucketAdapter,
) {
    fun create(
        @Valid inputDTO: CreateContestInputDTO,
    ): ContestOutputDTO {
        if (inputDTO.members.any { it.type == Member.Type.ROOT }) {
            throw ForbiddenException("Contest cannot have ROOT members")
        }

        val contest =
            Contest(
                title = inputDTO.title,
                languages = inputDTO.languages,
                startAt = inputDTO.startAt,
                endAt = inputDTO.endAt,
            )

        contest.members = inputDTO.members.map { createMember(contest, it) }
        contest.problems = inputDTO.problems.map { createProblem(contest, it) }

        contestRepository.save(contest)

        return contest.toOutputDTO(bucketAdapter)
    }

    fun createMember(
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

    fun createProblem(
        contest: Contest,
        problemDTO: CreateContestInputDTO.ProblemDTO,
    ): Problem {
        val problem =
            Problem(
                title = problemDTO.title,
                description = problemDTO.description,
                timeLimit = problemDTO.timeLimit,
                testCases = problemDTO.testCases,
                contest = contest,
            )

        return problem
    }
}
