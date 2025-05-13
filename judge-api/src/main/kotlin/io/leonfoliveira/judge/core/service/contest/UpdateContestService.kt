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
) {
    fun update(input: UpdateContestInputDTO): Contest {
        val contest =
            contestRepository.findById(input.id).orElseThrow {
                NotFoundException("Could not find contest with id = ${input.id}")
            }

        contest.title = input.title
        contest.languages = input.languages
        contest.startAt = input.startAt
        contest.endAt = input.endAt

        contest.members =
            input.members.map {
                if (it.id != null) {
                    val member =
                        contest.members.find { member -> member.id == it.id }
                            ?: throw NotFoundException("Could not find member with id = ${it.id}")
                    member.type = it.type
                    member.name = it.name
                    member.login = it.login
                    if (it.password != null) {
                        member.password = hashAdapter.hash(it.password)
                    }
                    member
                } else {
                    createMember(contest, it)
                }
            }
        contest.problems =
            input.problems.map {
                if (it.id != null) {
                    val problem =
                        contest.problems.find { problem -> problem.id == it.id }
                            ?: throw NotFoundException("Could not find problem with id = ${it.id}")
                    problem.title = it.title
                    problem.description = it.description
                    problem.timeLimit = it.timeLimit
                    if (it.testCases != null) {
                        problem.testCases = bucketAdapter.upload(it.testCases)
                    }
                    problem
                } else {
                    createProblem(contest, it)
                }
            }

        return contestRepository.save(contest)
    }

    private fun createMember(
        contest: Contest,
        memberDTO: UpdateContestInputDTO.MemberDTO,
    ): Member {
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

    private fun createProblem(
        contest: Contest,
        problemDTO: UpdateContestInputDTO.ProblemDTO,
    ): Problem {
        val testCases = bucketAdapter.upload(problemDTO.testCases!!)
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
