package io.github.leonfoliveira.judge.core.service.clarification

import io.github.leonfoliveira.judge.core.domain.entity.Clarification
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.event.ClarificationEvent
import io.github.leonfoliveira.judge.core.repository.ClarificationRepository
import io.github.leonfoliveira.judge.core.util.TransactionalEventPublisher
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class DeleteClarificationService(
    private val clarificationRepository: ClarificationRepository,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    fun delete(id: UUID) {
        val clarification = clarificationRepository.findById(id).orElseThrow {
            NotFoundException("Could not find clarification with id $id")
        }

        delete(clarification)
        clarificationRepository.save(clarification)
        transactionalEventPublisher.publish(
            ClarificationEvent(
                this,
                clarification,
                isDeleted = true
            )
        )
    }

    private fun delete(clarification: Clarification) {
        clarification.deletedAt = OffsetDateTime.now()
        clarification.children.forEach { delete(it) }
        transactionalEventPublisher.publish(
            ClarificationEvent(
                this,
                clarification,
                isDeleted = true
            )
        )
    }
}