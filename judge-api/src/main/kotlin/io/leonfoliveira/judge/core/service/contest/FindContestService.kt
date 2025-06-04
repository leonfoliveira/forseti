package io.leonfoliveira.judge.core.service.contest

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

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

    fun findById(id: Int): Contest {
        logger.info("Finding contest with id: $id")
        val contest =
            contestRepository.findById(id).orElseThrow {
                NotFoundException("Could not find contest with id = $id")
            }
        logger.info("Found contest")
        return contest
    }
}
