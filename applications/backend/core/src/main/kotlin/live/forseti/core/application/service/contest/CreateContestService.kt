package live.forseti.core.application.service.contest

import jakarta.validation.Valid
import live.forseti.core.domain.entity.Contest
import live.forseti.core.domain.exception.ConflictException
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driving.usecase.CreateContestUseCase
import live.forseti.core.port.dto.input.contest.CreateContestInputDTO
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
