package io.github.leonfoliveira.forseti.api.emitter

import io.github.leonfoliveira.forseti.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Clarification
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompClarificationEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun emit(clarification: Clarification) {
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

    fun emitDeleted(clarification: Clarification) {
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
