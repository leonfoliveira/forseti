package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : CreateContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Creates a new contest with the provided command data.
     *
     * @param command The command containing the data for creating the contest.
     * @return The created contest entity.
     */
    @Transactional
    override fun execute(
        @Valid command: CreateContestUseCase.Command,
    ): ContestResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Creating contest with slug: ${command.slug}")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId")

        if (member.type != Member.Type.ROOT) {
            throw ForbiddenException("Only ROOT members can create contests")
        }

        if (contestRepository.existsBySlug(command.slug)) {
            throw ConflictException("Contest with slug '${command.slug}' already exists")
        }

        val contest =
            Contest(
                slug = command.slug,
                title = command.title,
                languages = command.languages,
                startAt = command.startAt,
                endAt = command.endAt,
            )
        contestRepository.save(contest)
        businessEventPublisher.publish(ContestEvent.Created(contest.id))

        logger.info("Contest created successfully with id = ${contest.id}")
        return contest.toResponseBodyDTO()
    }
}
