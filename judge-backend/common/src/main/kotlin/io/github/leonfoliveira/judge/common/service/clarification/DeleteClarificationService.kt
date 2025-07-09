package io.github.leonfoliveira.judge.common.service.clarification

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.ClarificationEvent
import io.github.leonfoliveira.judge.common.repository.ClarificationRepository
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class DeleteClarificationService(
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun delete(id: UUID) {
        val clarification =
            clarificationRepository.findById(id).orElseThrow {
                NotFoundException("Could not find clarification with id $id")
            }

        delete(clarification)
        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(
            ClarificationEvent(
                this,
                clarification,
                isDeleted = true,
            ),
        )
    }

    private fun delete(clarification: Clarification) {
        clarification.deletedAt = OffsetDateTime.now()
        clarification.children.forEach { delete(it) }
        applicationEventPublisher.publishEvent(
            ClarificationEvent(
                this,
                clarification,
                isDeleted = true,
            ),
        )
    }
}
