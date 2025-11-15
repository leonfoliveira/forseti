package io.github.leonfoliveira.forseti.api.adapter.driven.emitter

import io.github.leonfoliveira.forseti.api.adapter.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.forseti.api.application.port.driven.ClarificationEmitter
import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompClarificationEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) : ClarificationEmitter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits a clarification to the appropriate STOMP topics.
     *
     * @param clarification The clarification to be emitted.
     */
    override fun emit(clarification: Clarification) {
        val contest = clarification.contest
        logger.info(
            "Emitting clarification with id: ${clarification.id} for contest with id: ${clarification.contest.id}",
        )

        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/clarifications",
            clarification.toResponseDTO(),
        )

        if (clarification.parent != null) {
            messagingTemplate.convertAndSend(
                "/topic/contests/${contest.id}/clarifications/children/members/${clarification.parent!!.member.id}",
                clarification.toResponseDTO(),
            )
        }
    }

    /**
     * Emits a deleted clarification event to the appropriate STOMP topic.
     *
     * @param clarification The clarification that was deleted.
     */
    override fun emitDeleted(clarification: Clarification) {
        val contest = clarification.contest
        logger.info(
            "Emitting deleted clarification with id: ${clarification.id} for contest with id: ${contest.id}",
        )

        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/clarifications/deleted",
            mapOf("id" to clarification.id),
        )
    }
}
