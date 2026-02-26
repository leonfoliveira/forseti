package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.application.listener.BusinessEventListener
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
) : BusinessEventListener<AnnouncementEvent.Created>() {
    @TransactionalEventListener(AnnouncementEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: AnnouncementEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: AnnouncementEvent.Created) {
        val announcement = event.announcement
        val contest = announcement.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
    }
}
