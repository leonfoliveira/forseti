package io.github.leonfoliveira.forseti.common.service.contest

import io.github.leonfoliveira.forseti.common.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FindContestService(
    private val contestRepository: ContestRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findAll(): List<Contest> {
        logger.info("Finding all contests")
        val contests = contestRepository.findAll().toList()
        logger.info("Found ${contests.size} contests")
        return contests
    }

    fun findById(id: UUID): Contest {
        logger.info("Finding contest with id: $id")
        val contest =
            contestRepository.findById(id).orElseThrow {
                NotFoundException("Could not find contest with id = $id")
            }
        logger.info("Found contest by id")
        return contest
    }

    fun findBySlug(slug: String): Contest {
        logger.info("Finding contest with slug: $slug")
        val contest =
            contestRepository.findBySlug(slug)
                ?: throw NotFoundException("Could not find contest with slug = $slug")
        logger.info("Found contest by slug")
        return contest
    }
}
