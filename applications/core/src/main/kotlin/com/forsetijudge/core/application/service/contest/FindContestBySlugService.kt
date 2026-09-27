package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FindContestBySlugService(
    private val contestRepository: ContestRepository,
) : FindContestBySlugUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Find a contest by its slug.
     *
     * @param command The command containing the slug of the contest to find.
     * @return The contest with the specified slug.
     */
    @Transactional(readOnly = true)
    override fun execute(command: FindContestBySlugUseCase.Command): ContestResponseBodyDTO {
        logger.info("Finding contest by slug: ${command.slug}")

        val contest =
            contestRepository.findBySlug(command.slug)
                ?: throw NotFoundException("Could not find contest with slug: ${command.slug}")

        logger.info("Found contest with id: ${contest.id}")
        return contest.toResponseBodyDTO()
    }
}
