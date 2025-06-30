package io.github.leonfoliveira.judge.common.service.contest

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.exception.ConflictException
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.service.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.judge.common.util.TestCasesValidator
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val testCasesValidator: TestCasesValidator,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun create(
        @Valid inputDTO: CreateContestInputDTO,
    ): Contest {
        logger.info("Creating contest with title: ${inputDTO.title}")

        if (inputDTO.members.any { it.type == Member.Type.ROOT }) {
            throw ForbiddenException("Contest cannot have ROOT members")
        }
        val duplicatedContestBySlug = contestRepository.findBySlug(inputDTO.slug)
        if (duplicatedContestBySlug != null) {
            throw ConflictException("Contest with slug '${inputDTO.slug}' already exists")
        }

        val contest =
            Contest(
                slug = inputDTO.slug,
                title = inputDTO.title,
                languages = inputDTO.languages,
                startAt = inputDTO.startAt,
                endAt = inputDTO.endAt,
            )

        contest.members = inputDTO.members.map { createMember(contest, it) }
        contest.problems = inputDTO.problems.map { createProblem(contest, it) }
        contestRepository.save(contest)

        logger.info("Contest created with id: ${contest.id}")
        return contest
    }

    fun createMember(
        contest: Contest,
        memberDTO: CreateContestInputDTO.MemberDTO,
    ): Member {
        logger.info("Creating member with login: ${memberDTO.login}")

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
        logger.info("Creating problem with title: ${problemDTO.title}")

        val description =
            attachmentRepository.findById(problemDTO.description.id).orElseThrow {
                NotFoundException("Could not find description attachment with id: ${problemDTO.description.id}")
            }
        val testCases =
            attachmentRepository.findById(problemDTO.testCases.id).orElseThrow {
                NotFoundException("Could not find testCases attachment with id: ${problemDTO.testCases.id}")
            }
        testCasesValidator.validate(testCases)

        val problem =
            Problem(
                letter = problemDTO.letter,
                title = problemDTO.title,
                description = description,
                timeLimit = problemDTO.timeLimit,
                memoryLimit = problemDTO.memoryLimit,
                testCases = testCases,
                contest = contest,
            )

        return problem
    }
}
