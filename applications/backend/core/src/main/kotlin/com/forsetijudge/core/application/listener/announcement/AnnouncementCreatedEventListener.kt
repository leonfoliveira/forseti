package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementCreatedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Announcement, AnnouncementEvent.Created>() {
    @TransactionalEventListener(AnnouncementEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: AnnouncementEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Announcement) {
        val announcement = payload

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(announcement.contest.id),
                event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                body = announcement.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardContestant(announcement.contest.id),
                event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                body = announcement.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardGuest(announcement.contest.id),
                event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                body = announcement.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardJudge(announcement.contest.id),
                event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                body = announcement.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardStaff(announcement.contest.id),
                event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                body = announcement.toResponseBodyDTO(),
            ),
        )
    }
}
