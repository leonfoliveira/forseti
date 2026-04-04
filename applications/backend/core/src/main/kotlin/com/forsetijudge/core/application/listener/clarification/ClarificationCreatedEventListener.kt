package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import org.springframework.stereotype.Component

@Component
class ClarificationCreatedEventListener(
    private val clarificationRepository: ClarificationRepository,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<ClarificationEvent.Created> {
    override fun handle(event: ClarificationEvent.Created) {
        val clarification =
            clarificationRepository.findById(event.clarificationId)
                ?: throw NotFoundException("Could not find clarification with id: ${event.clarificationId}")
        val contest = clarification.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildClarificationCreatedEvent(clarification))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildClarificationCreatedEvent(clarification))
        val parent = clarification.parent
        if (parent != null) {
            broadcastProducer.produce(
                ContestantPrivateBroadcastRoom(contest.id, parent.member.id).buildClarificationAnsweredEvent(
                    clarification,
                ),
            )
        }
    }
}
