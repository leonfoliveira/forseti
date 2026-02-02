package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.event.ClarificationDeletedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driving.usecase.clarification.DeleteClarificationUseCase
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
) : DeleteClarificationUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Soft deletes a clarification and all its children.
     *
     * @param id The ID of the clarification to be deleted.
     * @throws NotFoundException if the clarification is not found.
     */
    @Transactional
    override fun delete(
        contestId: UUID,
        id: UUID,
    ) {
        logger.info("Deleting clarification with id: $id in contest: $contestId")

        val clarification =
            clarificationRepository.findByIdAndContestId(id, contestId)
                ?: throw NotFoundException("Could not find clarification with id $id in contest")

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
