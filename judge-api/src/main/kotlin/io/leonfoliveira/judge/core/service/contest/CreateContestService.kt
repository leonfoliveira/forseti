package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
) {
    fun create(
        @Valid inputDTO: CreateContestInputDTO,
    ): Contest {
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

        return contestRepository.save(contest)
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
        val description =
            attachmentRepository.findById(problemDTO.description.key).orElseThrow {
                NotFoundException("Could not find description attachment with key = ${problemDTO.description.key}")
            }
        val testCases =
            attachmentRepository.findById(problemDTO.testCases.key).orElseThrow {
                NotFoundException("Could not find testCases attachment with key = ${problemDTO.testCases.key}")
            }

        val problem =
            Problem(
                title = problemDTO.title,
                description = description,
                timeLimit = problemDTO.timeLimit,
                testCases = testCases,
                contest = contest,
            )

        return problem
    }
}
