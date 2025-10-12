package io.github.leonfoliveira.forseti.common.service.contest

import io.github.leonfoliveira.forseti.common.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.domain.exception.ConflictException
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.service.dto.input.contest.CreateContestInputDTO
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val contestRepository: ContestRepository,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
