package io.github.leonfoliveira.judge.common.service.announcement

import io.github.leonfoliveira.judge.common.domain.entity.Announcement
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.AnnouncementEvent
import io.github.leonfoliveira.judge.common.repository.AnnouncementRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.service.dto.input.announcement.CreateAnnouncementInputDTO
import java.util.UUID
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class CreateAnnouncementService(
    private val contestRepository: ContestRepository,
    private val announcementRepository: AnnouncementRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest with id $contestId has not started yet")
        }
        val member =
            contest.members.find { it.id == memberId }
                ?: throw NotFoundException("Could not find member with id $memberId")

        val announcement =
            Announcement(
                contest = contest,
                member = member,
                text = input.text,
            )
        announcementRepository.save(announcement)
        applicationEventPublisher.publishEvent(AnnouncementEvent(this, announcement))
        logger.info("Announcement created successfully")
        return announcement
    }
}
