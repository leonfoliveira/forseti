package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [SubmissionCreatedEventListener::class])
class SubmissionCreatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    @MockkBean(relaxed = true)
    private val submissionQueueProducer: SubmissionQueueProducer,
    private val sut: SubmissionCreatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionEvent.Created(submission)
            sut.onApplicationEvent(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission),
                )
            }
            verify { broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }

            verify {
                submissionQueueProducer.produce(
                    SubmissionQueuePayload(submissionId = submission.id),
                )
            }
        }

        test("should not produce to submission queue if auto judge is disabled") {
            val contest = ContestMockBuilder.build()
            contest.settings.isAutoJudgeEnabled = false
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val event = SubmissionEvent.Created(submission)

            sut.onApplicationEvent(event)

            verify(exactly = 0) {
                submissionQueueProducer.produce(
                    SubmissionQueuePayload(submissionId = submission.id),
                )
            }
        }
    })
