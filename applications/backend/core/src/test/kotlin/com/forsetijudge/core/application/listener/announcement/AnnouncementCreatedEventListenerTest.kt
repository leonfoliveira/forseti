package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [AnnouncementCreatedEventListener::class])
class AnnouncementCreatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: AnnouncementCreatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val announcement = AnnouncementMockBuilder.build()
            val event = AnnouncementEvent.Created(announcement)

            sut.onApplicationEvent(event)

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
