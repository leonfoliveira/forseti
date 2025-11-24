package live.forseti.api.adapter.driven.emitter

import live.forseti.api.adapter.dto.response.clarification.toResponseDTO
import live.forseti.core.domain.entity.Clarification
import live.forseti.core.port.driven.WebSocketFanoutProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.io.Serializable

@Component
class StompClarificationEmitter(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits a clarification to the appropriate STOMP topics.
     *
     * @param clarification The clarification to be emitted.
     */
    fun emit(clarification: Clarification) {
        val contest = clarification.contest
        logger.info(
            "Emitting clarification with id: ${clarification.id} for contest with id: ${clarification.contest.id}",
        )

        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/clarifications",
            clarification.toResponseDTO(),
        )

        if (clarification.parent != null) {
            webSocketFanoutProducer.produce(
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
    fun emitDeleted(clarification: Clarification) {
        val contest = clarification.contest
        logger.info(
            "Emitting deleted clarification with id: ${clarification.id} for contest with id: ${contest.id}",
        )

        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/clarifications/deleted",
            mapOf("id" to clarification.id) as Serializable,
        )
    }
}
