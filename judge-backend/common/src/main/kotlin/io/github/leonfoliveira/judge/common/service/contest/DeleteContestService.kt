package io.github.leonfoliveira.judge.common.service.contest

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.ProblemRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
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
        contest.deletedAt = OffsetDateTime.now()
        contestRepository.save(contest)

        logger.info("Finished deleting contest with id: $id")
    }

    fun deleteMembers(members: List<Member>) {
        logger.info("Deleting members: ${members.joinToString { it.id.toString() }}")

        members.forEach { it.deletedAt = OffsetDateTime.now() }
        memberRepository.saveAll(members)

        logger.info("Finished deleting members: ${members.joinToString { it.id.toString() }}")
    }

    fun deleteProblems(problems: List<Problem>) {
        logger.info("Deleting problems: ${problems.joinToString { it.id.toString() }}")

        problems.forEach { it.deletedAt = OffsetDateTime.now() }
        problemRepository.saveAll(problems)

        logger.info("Finished deleting problems: ${problems.joinToString { it.id.toString() }}")
    }
}
