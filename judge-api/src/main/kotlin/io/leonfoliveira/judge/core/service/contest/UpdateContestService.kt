package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import org.springframework.stereotype.Service

@Service
class UpdateContestService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val bucketAdapter: BucketAdapter,
    private val findContestService: FindContestService,
    private val createContestService: CreateContestService,
    private val deleteContestService: DeleteContestService,
) {
    fun update(input: UpdateContestInputDTO): Contest {
        val contest = findContestService.findById(input.id)

        contest.title = input.title
        contest.languages = input.languages
        contest.startAt = input.startAt
        contest.endAt = input.endAt

        val membersToCreate = input.members.filter { it.id == null }
        val problemsToCreate = input.problems.filter { it.id == null }
        val createdMembers = membersToCreate.map { createContestService.createMember(contest, it.toCreateDTO()) }
        val createdProblems = problemsToCreate.map { createContestService.createProblem(contest, it.toCreateDTO()) }

        val membersToUpdate = input.members.filter { it.id != null }
        val problemsToUpdate = input.problems.filter { it.id != null }
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

        problem.title = problemDTO.title
        problem.description = problemDTO.description
        problem.timeLimit = problemDTO.timeLimit
        if (problemDTO.testCases != null) {
            problem.testCases = bucketAdapter.upload(problemDTO.testCases)
        }

        return problem
    }
}
