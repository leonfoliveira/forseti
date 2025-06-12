package io.github.leonfoliveira.judge.core.service.contest

import io.github.leonfoliveira.judge.core.domain.entity.Contest
import io.github.leonfoliveira.judge.core.domain.entity.Member
import io.github.leonfoliveira.judge.core.domain.entity.Problem
import io.github.leonfoliveira.judge.core.domain.exception.ConflictException
import io.github.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.port.HashAdapter
import io.github.leonfoliveira.judge.core.repository.AttachmentRepository
import io.github.leonfoliveira.judge.core.repository.ContestRepository
import io.github.leonfoliveira.judge.core.service.dto.input.contest.UpdateContestInputDTO
import io.github.leonfoliveira.judge.core.util.TestCasesValidator
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated
import java.util.UUID

@Service
@Validated
class UpdateContestService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val createContestService: CreateContestService,
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
            contestRepository.findById(inputDTO.id)
                .orElseThrow { NotFoundException("Could not find contest with id = ${inputDTO.id}") }
        if (contest.hasStarted()) {
            throw ForbiddenException("Contest has already started")
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

        val membersToCreate = inputDTO.members.filter { it.id == null }
        val problemsToCreate = inputDTO.problems.filter { it.id == null }
        val createdMembers = membersToCreate.map { createContestService.createMember(contest, it.toCreateDTO()) }
        val createdProblems = problemsToCreate.map { createContestService.createProblem(contest, it.toCreateDTO()) }

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
        if (problem.testCases.id != problemDTO.testCases) {
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
