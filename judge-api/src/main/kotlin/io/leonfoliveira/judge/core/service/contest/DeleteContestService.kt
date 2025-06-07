package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class DeleteContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun delete(id: UUID) {
        logger.info("Deleting contest with id: $id")

        val contest =
            contestRepository.findById(id).orElseThrow {
                NotFoundException("Could not find contest with id = $id")
            }
        if (contest.hasStarted()) {
            throw ForbiddenException("Contest already started")
        }
        contest.deletedAt = TimeUtils.now()
        contestRepository.save(contest)

        logger.info("Finished deleting contest with id: $id")
    }

    fun deleteMembers(members: List<Member>) {
        logger.info("Deleting members: ${members.joinToString { it.id.toString() }}")

        members.forEach { it.deletedAt = TimeUtils.now() }
        memberRepository.saveAll(members)

        logger.info("Finished deleting members: ${members.joinToString { it.id.toString() }}")
    }

    fun deleteProblems(problems: List<Problem>) {
        logger.info("Deleting problems: ${problems.joinToString { it.id.toString() }}")

        problems.forEach { it.deletedAt = TimeUtils.now() }
        problemRepository.saveAll(problems)

        logger.info("Finished deleting problems: ${problems.joinToString { it.id.toString() }}")
    }
}
