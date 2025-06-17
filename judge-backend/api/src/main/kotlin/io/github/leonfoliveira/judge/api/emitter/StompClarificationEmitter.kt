package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.core.domain.entity.Clarification
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompClarificationEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun emit(clarification: Clarification) {
        logger.info(
            "Emitting clarification with id: ${clarification.id} for contest with id: ${clarification.contest.id}",
        )

        val contest = clarification.contest

        if (clarification.deletedAt != null) {
            messagingTemplate.convertAndSend(
                "/topic/contests/${contest.id}/clarifications/deleted",
                mapOf("id" to clarification.id),
            )
            return
        }

        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/clarifications",
            clarification.toResponseDTO(),
        )
    }
}
