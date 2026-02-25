package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
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
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardAdmin(announcement.contest.id),
                        event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                        body = announcement.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardContestant(announcement.contest.id),
                        event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                        body = announcement.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardGuest(announcement.contest.id),
                        event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                        body = announcement.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardJudge(announcement.contest.id),
                        event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                        body = announcement.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardStaff(announcement.contest.id),
                        event = BroadcastEvent.ANNOUNCEMENT_CREATED,
                        body = announcement.toResponseBodyDTO(),
                    ),
                )
            }
        }
    })
