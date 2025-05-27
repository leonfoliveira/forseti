package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class UpdateContestService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val createContestService: CreateContestService,
    private val deleteContestService: DeleteContestService,
) {
    fun update(
        @Valid inputDTO: UpdateContestInputDTO,
    ): Contest {
        if (inputDTO.members.any { it.type == Member.Type.ROOT }) {
            throw ForbiddenException("Contest cannot have ROOT members")
        }

        val contest =
            contestRepository.findById(inputDTO.id)
                .orElseThrow { NotFoundException("Could not find contest with id = ${inputDTO.id}") }
        if (contest.hasStarted()) {
            throw ForbiddenException("Contest has already started")
        }

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

        return contestRepository.save(contest)
    }

    private fun updateMember(
        membersHash: Map<Int, Member>,
        memberDTO: UpdateContestInputDTO.MemberDTO,
    ): Member {
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
        problemsHash: Map<Int, Problem>,
        problemDTO: UpdateContestInputDTO.ProblemDTO,
    ): Problem {
        val problem =
            problemsHash[problemDTO.id]
                ?: throw NotFoundException("Could not find problem with id = ${problemDTO.id}")

        if (problem.description.key != problemDTO.description.key) {
            attachmentRepository.findById(problemDTO.description.key).orElseThrow {
                NotFoundException("Could not find description attachment with key = ${problemDTO.description.key}")
            }
        }
        if (problem.testCases.key != problemDTO.testCases) {
            attachmentRepository.findById(problemDTO.testCases.key).orElseThrow {
                NotFoundException("Could not find testCases attachment with key = ${problemDTO.testCases.key}")
            }
        }

        problem.title = problemDTO.title
        problem.timeLimit = problemDTO.timeLimit

        return problem
    }
}
