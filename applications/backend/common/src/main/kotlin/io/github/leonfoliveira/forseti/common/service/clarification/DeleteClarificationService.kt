package io.github.leonfoliveira.forseti.common.service.clarification

import io.github.leonfoliveira.forseti.common.domain.entity.Clarification
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.event.ClarificationDeletedEvent
import io.github.leonfoliveira.forseti.common.repository.ClarificationRepository
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.UUID

@Service
class DeleteClarificationService(
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun delete(id: UUID) {
        logger.info("Deleting clarification with id: $id")

        val clarification =
            clarificationRepository.findById(id).orElseThrow {
                NotFoundException("Could not find clarification with id $id")
            }

        delete(clarification)
        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(ClarificationDeletedEvent(this, clarification))

        logger.info("Clarification deleted successfully")
    }

    private fun delete(clarification: Clarification) {
        clarification.deletedAt = OffsetDateTime.now()
        clarification.children.forEach { delete(it) }
    }
}
