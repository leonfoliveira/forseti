package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.entity.model.RawAttachment
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import java.time.LocalDateTime
import org.springframework.stereotype.Service

@Service
class CreateContestService(
    private val contestRepository: ContestRepository,
    private val hashAdapter: HashAdapter,
    private val s3Adapter: BucketAdapter,
) {
    data class Input(
        val title: String,
        val languages: List<Language>,
        val startTime: LocalDateTime,
        val endTime: LocalDateTime,
        val members: List<MemberDTO>,
        val problems: List<ProblemDTO>,
    ) {
        data class MemberDTO(
            val type: Member.Type,
            val name: String,
            val login: String,
            val password: String,
        )

        data class ProblemDTO(
            val title: String,
            val description: String,
            val timeLimit: Int,
            val languages: List<Language>,
            val testCases: RawAttachment,
        )
    }

    fun create(input: Input): Contest {
        val contest = Contest(
            title = input.title,
            languages = input.languages,
            startTime = input.startTime,
            endTime = input.endTime,
        )

        contest.members = input.members.map { createMember(contest, it) }
        contest.problems = input.problems.map { createProblem(contest, it) }

        return contestRepository.save(contest)
    }

    private fun createMember(contest: Contest, memberDTO: Input.MemberDTO): Member {
        val hashedPassword = hashAdapter.hash(memberDTO.password)
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
        val testCases = s3Adapter.upload(problemDTO.testCases)
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