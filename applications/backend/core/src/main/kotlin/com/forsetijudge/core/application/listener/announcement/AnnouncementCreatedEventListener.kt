package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
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

        broadcastProducer.produce(AdminDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement))
    }
}
