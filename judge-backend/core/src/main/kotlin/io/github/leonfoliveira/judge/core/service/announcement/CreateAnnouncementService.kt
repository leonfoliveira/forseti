package io.github.leonfoliveira.judge.core.service.announcement

import io.github.leonfoliveira.judge.core.domain.entity.Announcement
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.event.AnnouncementEvent
import io.github.leonfoliveira.judge.core.repository.AnnouncementRepository
import io.github.leonfoliveira.judge.core.repository.ContestRepository
import io.github.leonfoliveira.judge.core.service.dto.input.announcement.CreateAnnouncementInputDTO
import io.github.leonfoliveira.judge.core.util.TransactionalEventPublisher
import java.util.UUID
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CreateAnnouncementService(
    private val contestRepository: ContestRepository,
    private val announcementRepository: AnnouncementRepository,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun create(
        contestId: UUID,
        memberId: UUID,
        input: CreateAnnouncementInputDTO,
    ) : Announcement {
        logger.info("Creating announcement for contest with id: $contestId")

        val contest = contestRepository.findById(contestId).orElseThrow {
            NotFoundException("Could not find contest with id $contestId")
        }
        if (!contest.hasStarted()) {
            throw NotFoundException("Contest with id $contestId has not started yet")
        }
        val member = contest.members.find { it.id == memberId}
            ?: throw NotFoundException("Could not find member with id $memberId")

        val announcement = Announcement(
            contest = contest,
            member = member,
            text = input.text,
        )
        announcementRepository.save(announcement)
        transactionalEventPublisher.publish(AnnouncementEvent(this, announcement))
        logger.info("Announcement created successfully")
        return announcement
    }
}