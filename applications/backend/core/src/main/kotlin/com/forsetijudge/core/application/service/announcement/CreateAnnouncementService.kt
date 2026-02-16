package com.forsetijudge.core.application.service.announcement

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.AnnouncementCreatedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.AnnouncementRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.port.dto.input.announcement.CreateAnnouncementInputDTO
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CreateAnnouncementService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val announcementRepository: AnnouncementRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateAnnouncementUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a new announcement for a contest
     *
     * @param contestId The id of the contest
     * @param memberId The id of the member creating the announcement
     * @param input The announcement input data
     * @return The created announcement
     * @throws NotFoundException if the contest or member does not exist
     */
    @Transactional
    override fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateAnnouncementInputDTO,
    ): Announcement {
        logger.info("Creating announcement for contest with id: $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id $memberId")

        ContestAuthorizer(contest, member).checkMemberType(Member.Type.ROOT, Member.Type.ADMIN)

        val announcement =
            Announcement(
                contest = contest,
                member = member,
                text = input.text,
            )
        announcementRepository.save(announcement)
        applicationEventPublisher.publishEvent(AnnouncementCreatedEvent(this, announcement))

        logger.info("Announcement created successfully")
        return announcement
    }
}
