package io.github.leonfoliveira.forseti.common.application.service.clarification

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import io.github.leonfoliveira.forseti.common.application.domain.event.ClarificationDeletedEvent
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ClarificationRepository
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
class DeleteClarificationService(
    private val clarificationRepository: ClarificationRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Soft deletes a clarification and all its children.
     *
     * @param id The ID of the clarification to be deleted.
     * @throws NotFoundException if the clarification is not found.
     */
    @Transactional
    fun delete(id: UUID) {
        logger.info("Deleting clarification with id: $id")

        val clarification =
            clarificationRepository.findEntityById(id)
                ?: throw NotFoundException("Could not find clarification with id $id")

        delete(clarification)
        clarificationRepository.save(clarification)
        applicationEventPublisher.publishEvent(ClarificationDeletedEvent(this, clarification))

        logger.info("Clarification deleted successfully")
    }

    /**
     * Recursively soft deletes a clarification and all its children.
     *
     * @param clarification The clarification to be deleted.
     */
    private fun delete(clarification: Clarification) {
        clarification.deletedAt = OffsetDateTime.now()
        clarification.children.forEach { delete(it) }
    }
}
