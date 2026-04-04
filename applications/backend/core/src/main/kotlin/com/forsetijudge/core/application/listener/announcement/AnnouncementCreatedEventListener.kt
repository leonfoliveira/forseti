package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.AnnouncementRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementCreatedEventListener(
    private val announcementRepository: AnnouncementRepository,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<AnnouncementEvent.Created> {
    override fun handle(event: AnnouncementEvent.Created) {
        val announcement =
            announcementRepository.findById(event.announcementId)
                ?: throw NotFoundException("Could not find announcement with id: ${event.announcementId}")
        val contest = announcement.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildAnnouncementCreatedEvent(announcement))
    }
}
