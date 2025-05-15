package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.stereotype.Service

@Service
class DeleteContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
) {
    fun delete(id: Int) {
        val contest =
            contestRepository.findById(id).orElseThrow {
                NotFoundException("Could not find contest with id = $id")
            }
        if (contest.hasStarted()) {
            throw ForbiddenException("Contest already started")
        }
        contest.deletedAt = TimeUtils.now()
        contestRepository.save(contest)
    }

    fun deleteMembers(members: List<Member>) {
        members.forEach { it.deletedAt = TimeUtils.now() }
        memberRepository.saveAll(members)
    }

    fun deleteProblems(problems: List<Problem>) {
        problems.forEach { it.deletedAt = TimeUtils.now() }
        problemRepository.saveAll(problems)
    }
}
