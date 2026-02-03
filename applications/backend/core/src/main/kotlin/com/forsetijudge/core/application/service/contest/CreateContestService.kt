package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.dto.input.contest.CreateContestInputDTO
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val contestRepository: ContestRepository,
) : CreateContestUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a new contest.
     *
     * @param inputDTO Data for creating the contest
     * @return The created contest
     * @throws ConflictException if a contest with the same slug already exists
     */
    @Transactional
    override fun create(
        @Valid inputDTO: CreateContestInputDTO,
    ): Contest {
        logger.info("Creating contest with title: ${inputDTO.title}")

        if (contestRepository.existsBySlug(inputDTO.slug)) {
            throw ConflictException("Contest with slug '${inputDTO.slug}' already exists")
        }

        val contest =
            Contest(
                slug = inputDTO.slug,
                title = inputDTO.title,
                languages = inputDTO.languages,
                startAt = inputDTO.startAt,
                endAt = inputDTO.endAt,
            )
        contestRepository.save(contest)

        logger.info("Contest created with id: ${contest.id}")
        return contest
    }
}
