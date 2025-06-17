package io.github.leonfoliveira.judge.core.service.clarification

import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.event.ClarificationEvent
import io.github.leonfoliveira.judge.core.repository.ClarificationRepository
import io.github.leonfoliveira.judge.core.util.TransactionalEventPublisher
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

        clarificationRepository.deleteById(id)
        transactionalEventPublisher.publish(
            ClarificationEvent(
                this,
                clarification,
            )
        )
    }
}