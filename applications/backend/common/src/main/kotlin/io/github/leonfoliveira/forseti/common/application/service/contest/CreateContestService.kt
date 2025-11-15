package io.github.leonfoliveira.forseti.common.application.service.contest

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.exception.ConflictException
import io.github.leonfoliveira.forseti.common.application.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val contestRepository: ContestRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a new contest.
     *
     * @param inputDTO Data for creating the contest
     * @return The created contest
     * @throws ConflictException if a contest with the same slug already exists
     */
    @Transactional
    fun create(
        @Valid inputDTO: CreateContestInputDTO,
    ): Contest {
        logger.info("Creating contest with title: ${inputDTO.title}")

        val duplicatedContestBySlug = contestRepository.findBySlug(inputDTO.slug)
        if (duplicatedContestBySlug != null) {
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
