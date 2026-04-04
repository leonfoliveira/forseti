package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.AnnouncementRepository
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

class AnnouncementCreatedEventListenerTest :
    FunSpec({
        val announcementRepository = mockk<AnnouncementRepository>(relaxed = true)
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)

        val sut =
            AnnouncementCreatedEventListener(
                announcementRepository = mockk(),
                broadcastProducer = broadcastProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val announcement = AnnouncementMockBuilder.build()
            val event = AnnouncementEvent.Created(announcement.id)
            every { announcementRepository.findById(announcement.id) } returns announcement

            sut.handle(event)

            verify {
                broadcastProducer.produce(
                    AdminDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement),
                )
            }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement),
                )
            }
            verify {
                broadcastProducer.produce(
                    GuestDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement),
                )
            }
            verify {
                broadcastProducer.produce(
                    JudgeDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement),
                )
            }
            verify {
                broadcastProducer.produce(
                    StaffDashboardBroadcastRoom(announcement.contest.id).buildAnnouncementCreatedEvent(announcement),
                )
            }
        }
    })
