package com.forsetijudge.core.application.service.external.announcement

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.AnnouncementRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.driving.usecase.internal.outbox.PublishOutboxEventInternalUseCase
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import jakarta.validation.Valid
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateAnnouncementService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val announcementRepository: AnnouncementRepository,
    private val publishOutboxEventInternalUseCase: PublishOutboxEventInternalUseCase,
) : CreateAnnouncementUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(
        @Valid command: CreateAnnouncementUseCase.Command,
    ): AnnouncementResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Creating announcement")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id = $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()

        val announcement =
            Announcement(
                contest = contest,
                member = member,
                text = command.text,
            )
        announcementRepository.save(announcement)
        publishOutboxEventInternalUseCase.execute(
            PublishOutboxEventInternalUseCase.Command(AnnouncementEvent.Created(announcement.id)),
        )

        logger.info("Announcement created successfully with id = ${announcement.id}")
        return announcement.toResponseBodyDTO()
    }
}
