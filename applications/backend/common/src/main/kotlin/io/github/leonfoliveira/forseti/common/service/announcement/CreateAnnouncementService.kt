package io.github.leonfoliveira.forseti.common.service.announcement

import io.github.leonfoliveira.forseti.common.domain.entity.Announcement
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.event.AnnouncementCreatedEvent
import io.github.leonfoliveira.forseti.common.repository.AnnouncementRepository
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.service.dto.input.announcement.CreateAnnouncementInputDTO
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

    @Transactional
    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateAnnouncementInputDTO,
    ): Announcement {
        logger.info("Creating announcement for contest with id: $contestId")

        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id $contestId")
            }
        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id $memberId")
            }

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
