package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.contest.FindContestUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) : FindContestUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Find all contests.
     *
     * @return List of contests.
     */
    @Transactional(readOnly = true)
    override fun findAll(): List<Contest> {
        logger.info("Finding all contests")
        val contests = contestRepository.findAll().toList()
        logger.info("Found ${contests.size} contests")
        return contests
    }

    /**
     * Finds a contest by its ID.
     * This method can only be used after the contest has started or the member is ADMIN/ROOT.
     *
     * @param memberId The ID of the member requesting the contest.
     * @param id The ID of the contest to find.
     * @return The contest entity.
     * @throws NotFoundException if the contest is not found.
     */
    @Transactional(readOnly = true)
    override fun findByIdPublic(
        memberId: UUID?,
        id: UUID,
    ): Contest {
        logger.info("Finding contest with id: $id for member: $memberId")
        val member =
            memberId?.let {
                memberRepository.findEntityById(it)
                    ?: throw NotFoundException("Could not find member with id = $it")
            }
        val contest =
            contestRepository.findEntityById(id)
                ?: throw NotFoundException("Could not find contest with id = $id")

        if (!contest.hasStarted() && !setOf(Member.Type.ADMIN, Member.Type.ROOT).contains(member?.type)) {
            throw ForbiddenException("Contest has not started yet")
        }

        logger.info("Found contest by id for public access")
        return contest
    }

    /**
     * Find contest by id.
     *
     * @param id Contest id.
     * @return Contest.
     * @throws NotFoundException if contest is not found.
     */
    @Transactional(readOnly = true)
    override fun findById(id: UUID): Contest {
        logger.info("Finding contest with id: $id")
        val contest =
            contestRepository.findEntityById(id)
                ?: throw NotFoundException("Could not find contest with id = $id")
        logger.info("Found contest by id")
        return contest
    }

    /**
     * Find contest by slug.
     *
     * @param slug Contest slug.
     * @return Contest.
     * @throws NotFoundException if contest is not found.
     */
    @Transactional(readOnly = true)
    override fun findBySlug(slug: String): Contest {
        logger.info("Finding contest with slug: $slug")
        val contest =
            contestRepository.findBySlug(slug)
                ?: throw NotFoundException("Could not find contest with slug = $slug")
        logger.info("Found contest by slug")
        return contest
    }
}
