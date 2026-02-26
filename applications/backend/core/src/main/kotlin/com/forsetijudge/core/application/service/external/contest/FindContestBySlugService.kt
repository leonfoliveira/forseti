package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.FindContestBySlugUseCase
import org.springframework.stereotype.Service

@Service
class FindContestBySlugService(
    private val contestRepository: ContestRepository,
) : FindContestBySlugUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: FindContestBySlugUseCase.Command): Contest {
        logger.info("Finding contest by slug: ${command.slug}")

        val contest =
            contestRepository.findBySlug(command.slug)
                ?: throw NotFoundException("Could not find contest with slug: ${command.slug}")

        logger.info("Found contest with id: ${contest.id}")
        return contest
    }
}
