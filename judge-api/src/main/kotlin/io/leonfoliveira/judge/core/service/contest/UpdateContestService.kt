package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.entity.model.RawAttachment
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.S3Adapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import java.time.LocalDateTime
import org.springframework.stereotype.Service

@Service
class UpdateContestService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val s3Adapter: S3Adapter,
) {
    data class Input(
        val id: Int,
        val title: String,
        val languages: List<Language>,
        val startTime: LocalDateTime,
        val endTime: LocalDateTime,
        val members: List<MemberDTO>,
        val problems: List<ProblemDTO>,
    ) {
        data class MemberDTO(
            val id: Int?,
            val type: Member.Type,
            val name: String,
            val login: String,
            val password: String?,
        )

        data class ProblemDTO(
            val id: Int?,
            val title: String,
            val description: String,
            val timeLimit: Int,
            val languages: List<Language>,
            val testCases: RawAttachment?,
        )
    }

    fun update(input: Input): Contest {
        val contest = contestRepository.findById(input.id).orElseThrow {
            throw NotFoundException("Could not find contest with id = ${input.id}")
        }

        contest.title = input.title
        contest.languages = input.languages
        contest.startTime = input.startTime
        contest.endTime = input.endTime

        contest.members = input.members.map {
            if (it.id != null) {
                val member = contest.members.find { member -> member.id == it.id }
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
        contest.problems = input.problems.map {
            if (it.id != null) {
                val problem = contest.problems.find { problem -> problem.id == it.id }
                    ?: throw NotFoundException("Could not find problem with id = ${it.id}")
                problem.title = it.title
                problem.description = it.description
                problem.timeLimit = it.timeLimit
                if (it.testCases != null) {
                    problem.testCases = s3Adapter.upload(it.testCases)
                }
                problem
            } else {
                createProblem(contest, it)
            }
        }

        return contestRepository.save(contest)
    }

    private fun createMember(contest: Contest, memberDTO: Input.MemberDTO): Member {
        val hashedPassword = hashAdapter.hash(memberDTO.password!!)
        val member = Member(
            type = memberDTO.type,
            name = memberDTO.name,
            login = memberDTO.login,
            password = hashedPassword,
            contest = contest,
        )

        return member
    }

    private fun createProblem(contest: Contest, problemDTO: Input.ProblemDTO): Problem {
        val testCases = s3Adapter.upload(problemDTO.testCases!!)
        val problem = Problem(
            title = problemDTO.title,
            description = problemDTO.description,
            timeLimit = problemDTO.timeLimit,
            testCases = testCases,
            contest = contest,
        )

        return problem
    }
}