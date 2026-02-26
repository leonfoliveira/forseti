package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.CreateContestUseCase
import jakarta.validation.Valid
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateContestService(
    private val memberRepository: MemberRepository,
    private val contestRepository: ContestRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateContestUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(
        @Valid command: CreateContestUseCase.Command,
    ): Contest {
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Creating contest with slug: ${command.slug}")

        val member =
            memberRepository.findById(contextMemberId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId")

        ContestAuthorizer(null, member)
            .requireMemberType(Member.Type.ROOT)
            .throwIfErrors()

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
        applicationEventPublisher.publishEvent(ContestEvent.Created(contest))

        logger.info("Contest created with id: ${contest.id}")
        return contest
    }
}
