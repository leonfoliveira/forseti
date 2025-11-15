package io.github.leonfoliveira.forseti.common.application.service.contest

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.application.port.driving.FindContestUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindContestService(
    private val contestRepository: ContestRepository,
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
