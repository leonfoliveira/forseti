package com.forsetijudge.core.api.listener.announcement

import com.forsetijudge.core.api.http.sse.SSE
import com.forsetijudge.core.api.http.sse.SSERoomBuilder
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.port.output.repository.AnnouncementRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class ApiAnnouncementCreatedEventListener(
    private val announcementRepository: AnnouncementRepository,
    private val sseFanoutRedisMessageProducer: SSEFanoutRedisMessageProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    fun handle(event: AnnouncementEvent.Created) {
        logger.info("Handling announcement created event for announcement with id: ${event.announcementId}")

        val announcement =
            announcementRepository.findById(event.announcementId)
                ?: throw NotFoundException("Could not find announcement with id: ${event.announcementId}")
        val contest = announcement.contest

        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildAdminDashboardRoom(contest.id),
                eventName = SSE.ANNOUNCEMENT_CREATED.name,
                data = announcement.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildJudgeDashboardRoom(contest.id),
                eventName = SSE.ANNOUNCEMENT_CREATED.name,
                data = announcement.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildStaffDashboardRoom(contest.id),
                eventName = SSE.ANNOUNCEMENT_CREATED.name,
                data = announcement.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildContestantDashboardRoom(contest.id),
                eventName = SSE.ANNOUNCEMENT_CREATED.name,
                data = announcement.toResponseDTO(),
            ),
        )
        sseFanoutRedisMessageProducer.produce(
            SSEFanoutMessage(
                room = SSERoomBuilder.buildGuestDashboardRoom(contest.id),
                eventName = SSE.ANNOUNCEMENT_CREATED.name,
                data = announcement.toResponseDTO(),
            ),
        )
    }
}
