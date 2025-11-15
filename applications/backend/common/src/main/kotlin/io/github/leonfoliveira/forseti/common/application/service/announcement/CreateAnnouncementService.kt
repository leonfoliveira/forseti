package io.github.leonfoliveira.forseti.common.application.service.announcement

import io.github.leonfoliveira.forseti.common.application.domain.entity.Announcement
import io.github.leonfoliveira.forseti.common.application.domain.event.AnnouncementCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.AnnouncementRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.service.dto.input.announcement.CreateAnnouncementInputDTO
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
) {
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
    fun create(
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
