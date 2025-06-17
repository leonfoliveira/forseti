package io.github.leonfoliveira.judge.core.service.announcement

import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.event.AnnouncementEvent
import io.github.leonfoliveira.judge.core.repository.AnnouncementRepository
import io.github.leonfoliveira.judge.core.util.TransactionalEventPublisher
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class DeleteAnnouncementService(
    private val announcementRepository: AnnouncementRepository,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    fun delete(id: UUID) {
        val announcement = announcementRepository.findById(id).orElseThrow {
            NotFoundException("Could not find announcement with id $id")
        }

        announcement.deletedAt = OffsetDateTime.now()
        announcementRepository.save(announcement)
        transactionalEventPublisher.publish(
            AnnouncementEvent(
                this,
                announcement,
                isDeleted = true
            )
        )
    }
}