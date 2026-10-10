package com.forsetijudge.core.application.service.announcement

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.output.repository.AnnouncementRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateAnnouncementService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val announcementRepository: AnnouncementRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : CreateAnnouncementUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Creates a new announcement for a contest.
     *
     * @param command The command containing the contest ID and announcement text.
     * @return The created announcement.
     */
    @Transactional
    override fun execute(
        @Valid command: CreateAnnouncementUseCase.Command,
    ): AnnouncementResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Creating new announcement for contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()

        val announcement =
            Announcement(
                contest = contest,
                member = member,
                text = command.text,
            )
        announcementRepository.save(announcement)
        businessEventPublisher.publish(AnnouncementEvent.Created(announcement.id))

        logger.info("Created announcement with id: ${command.contestId}")
        return announcement.toResponseBodyDTO()
    }
}
