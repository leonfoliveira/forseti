package io.github.leonfoliveira.forseti.common.application.service.contest

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.entity.Problem
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ProblemRepository
import io.github.leonfoliveira.forseti.common.application.port.driving.DeleteContestUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
class DeleteContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
) : DeleteContestUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Soft delete a contest.
     *
     * @param id The id of the contest to be deleted.
     * @throws NotFoundException if the contest does not exist.
     * @throws ForbiddenException if the contest has already started.
     */
    @Transactional
    override fun delete(id: UUID) {
        logger.info("Deleting contest with id: $id")

        val contest =
            contestRepository.findEntityById(id)
                ?: throw NotFoundException("Could not find contest with id = $id")
        // Business rule: A contest that has started cannot be deleted
        if (contest.hasStarted()) {
            throw ForbiddenException("Contest already started")
        }
        contest.deletedAt = OffsetDateTime.now()
        contestRepository.save(contest)

        logger.info("Finished deleting contest with id: $id")
    }

    /**
     * Soft delete a list of members.
     *
     * @param members The list of members to be deleted.
     */
    @Transactional
    override fun deleteMembers(members: List<Member>) {
        logger.info("Deleting members: ${members.joinToString { it.id.toString() }}")

        members.forEach { it.deletedAt = OffsetDateTime.now() }
        memberRepository.saveAll(members)

        logger.info("Finished deleting members: ${members.joinToString { it.id.toString() }}")
    }

    /**
     * Soft delete a list of problems.
     *
     * @param problems The list of problems to be deleted.
     */
    @Transactional
    fun deleteProblems(problems: List<Problem>) {
        logger.info("Deleting problems: ${problems.joinToString { it.id.toString() }}")

        problems.forEach { it.deletedAt = OffsetDateTime.now() }
        problemRepository.saveAll(problems)

        logger.info("Finished deleting problems: ${problems.joinToString { it.id.toString() }}")
    }
}
