package io.github.leonfoliveira.judge.common.service.contest

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.exception.BusinessException
import io.github.leonfoliveira.judge.common.domain.exception.ConflictException
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.service.dto.input.contest.UpdateContestInputDTO
import io.github.leonfoliveira.judge.common.util.TestCasesValidator
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Validated
class UpdateContestService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val deleteContestService: DeleteContestService,
    private val testCasesValidator: TestCasesValidator,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun update(
        @Valid inputDTO: UpdateContestInputDTO,
    ): Contest {
        logger.info("Updating contest with id: ${inputDTO.id}")

        if (inputDTO.members.any { it.type == Member.Type.ROOT }) {
            throw ForbiddenException("Contest cannot have ROOT members")
        }
        val contest =
            contestRepository
                .findById(inputDTO.id)
                .orElseThrow { NotFoundException("Could not find contest with id = ${inputDTO.id}") }
        if (contest.hasFinished()) {
            throw ForbiddenException("Contest has already finished and cannot be updated")
        }
        if (contest.hasStarted()) {
            if (!inputDTO.startAt.truncatedTo(ChronoUnit.SECONDS).isEqual(contest.startAt.truncatedTo(ChronoUnit.SECONDS))) {
                throw ForbiddenException("Contest has already started and cannot have its start time updated")
            }
        } else {
            if (inputDTO.startAt.isBefore(OffsetDateTime.now())) {
                throw BusinessException("Contest start time must be in the future")
            }
        }
        val duplicatedContestBySlug = contestRepository.findBySlug(inputDTO.slug)
        if (duplicatedContestBySlug != null && duplicatedContestBySlug.id != contest.id) {
            throw ConflictException("Contest with slug '${inputDTO.slug}' already exists")
        }

        contest.slug = inputDTO.slug
        contest.title = inputDTO.title
        contest.languages = inputDTO.languages
        contest.startAt = inputDTO.startAt
        contest.endAt = inputDTO.endAt
        contest.settings =
            Contest.Settings(
                isAutoJudgeEnabled = inputDTO.settings.isAutoJudgeEnabled,
            )

        val membersToCreate = inputDTO.members.filter { it.id == null }
        val problemsToCreate = inputDTO.problems.filter { it.id == null }
        val createdMembers = membersToCreate.map { createMember(contest, it) }
        val createdProblems = problemsToCreate.map { createProblem(contest, it) }

        val membersToUpdate = inputDTO.members.filter { it.id != null }
        val problemsToUpdate = inputDTO.problems.filter { it.id != null }
        val membersHash = contest.members.associateBy { it.id }
        val problemsHash = contest.problems.associateBy { it.id }
        val updatedMembers = membersToUpdate.map { updateMember(membersHash, it) }
        val updatedProblems = problemsToUpdate.map { updateProblem(problemsHash, it) }

        val membersToUpdateIds = membersToUpdate.map { it.id }.toSet()
        val problemsToUpdateIds = problemsToUpdate.map { it.id }.toSet()
        val membersToDelete = contest.members.filter { it.id !in membersToUpdateIds }
        val problemsToDelete = contest.problems.filter { it.id !in problemsToUpdateIds }
        deleteContestService.deleteMembers(membersToDelete)
        deleteContestService.deleteProblems(problemsToDelete)

        contest.members = createdMembers + updatedMembers
        contest.problems = createdProblems + updatedProblems
        contestRepository.save(contest)

        logger.info("Finished updating contest with id: ${contest.id}")
        return contest
    }

    fun forceStart(contestId: UUID): Contest {
        val contest =
            contestRepository
                .findById(contestId)
                .orElseThrow { NotFoundException("Could not find contest with id = $contestId") }
        if (contest.hasStarted()) {
            throw ForbiddenException("Contest with id: $contestId has already started")
        }

        contest.startAt = OffsetDateTime.now()
        contestRepository.save(contest)
        return contest
    }

    fun forceEnd(contestId: UUID): Contest {
        val contest =
            contestRepository
                .findById(contestId)
                .orElseThrow { NotFoundException("Could not find contest with id = $contestId") }
        if (!contest.isActive()) {
            throw ForbiddenException("Contest with id: $contestId is not active")
        }

        contest.endAt = OffsetDateTime.now()
        contestRepository.save(contest)
        return contest
    }

    fun createMember(
        contest: Contest,
        memberDTO: UpdateContestInputDTO.MemberDTO,
    ): Member {
        logger.info("Creating member with login: ${memberDTO.login}")

        if (memberDTO.login == Member.ROOT_LOGIN) {
            throw ForbiddenException("Member login cannot be '${Member.ROOT_LOGIN}'")
        }

        val hashedPassword = hashAdapter.hash(memberDTO.password!!)
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
        problemDTO: UpdateContestInputDTO.ProblemDTO,
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

    private fun updateMember(
        membersHash: Map<UUID, Member>,
        memberDTO: UpdateContestInputDTO.MemberDTO,
    ): Member {
        logger.info("Updating member with id: ${memberDTO.id}")

        val member =
            membersHash[memberDTO.id]
                ?: throw NotFoundException("Could not find member with id = ${memberDTO.id}")

        member.type = memberDTO.type
        member.name = memberDTO.name
        member.login = memberDTO.login
        if (memberDTO.password != null) {
            member.password = hashAdapter.hash(memberDTO.password)
        }

        return member
    }

    private fun updateProblem(
        problemsHash: Map<UUID, Problem>,
        problemDTO: UpdateContestInputDTO.ProblemDTO,
    ): Problem {
        logger.info("Updating problem with id: ${problemDTO.id}")

        val problem =
            problemsHash[problemDTO.id]
                ?: throw NotFoundException("Could not find problem with id = ${problemDTO.id}")

        if (problem.description.id != problemDTO.description.id) {
            val description =
                attachmentRepository.findById(problemDTO.description.id).orElseThrow {
                    NotFoundException("Could not find description attachment with id: ${problemDTO.description.id}")
                }
            problem.description = description
        }
        if (problem.testCases.id != problemDTO.testCases.id) {
            val testCases =
                attachmentRepository.findById(problemDTO.testCases.id).orElseThrow {
                    NotFoundException("Could not find testCases attachment with id: ${problemDTO.testCases.id}")
                }
            testCasesValidator.validate(testCases)
            problem.testCases = testCases
        }

        problem.letter = problemDTO.letter
        problem.title = problemDTO.title
        problem.timeLimit = problemDTO.timeLimit
        problem.memoryLimit = problemDTO.memoryLimit

        return problem
    }
}
