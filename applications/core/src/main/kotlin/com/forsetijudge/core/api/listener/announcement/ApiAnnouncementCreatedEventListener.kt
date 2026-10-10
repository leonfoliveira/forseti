package com.forsetijudge.core.api.listener.announcement

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.api.websocket.room.SocketIOAdminDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOContestantDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOGuestDashboardRoom
import com.forsetijudge.core.api.websocket.room.SocketIOJudgeDashboardRoom
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.repository.AnnouncementRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiAnnouncementCreatedEventListener(
    private val announcementRepository: AnnouncementRepository,
    private val socketIOFanoutRedisMessageProducer: SocketIOFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    fun handle(event: AnnouncementEvent.Created) {
        logger.info("Handling announcement created event for announcement with id: ${event.announcementId}")

        val announcement =
            announcementRepository.findById(event.announcementId)
                ?: throw NotFoundException("Could not find announcement with id: ${event.announcementId}")
        val contest = announcement.contest

        socketIOFanoutRedisMessageProducer.produce(
            SocketIOAdminDashboardRoom(contest.id).buildAnnouncementCreatedEvent(
                announcement,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOContestantDashboardRoom(contest.id).buildAnnouncementCreatedEvent(
                announcement,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOGuestDashboardRoom(contest.id).buildAnnouncementCreatedEvent(
                announcement,
            ),
        )
        socketIOFanoutRedisMessageProducer.produce(
            SocketIOJudgeDashboardRoom(contest.id).buildAnnouncementCreatedEvent(
                announcement,
            ),
        )
    }
}
