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
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionCreatedEventListenerTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)
        val submissionQueueProducer = mockk<SubmissionQueueProducer>(relaxed = true)

        val sut =
            SubmissionCreatedEventListener(
                submissionRepository = submissionRepository,
                broadcastProducer = broadcastProducer,
                submissionQueueProducer = submissionQueueProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionEvent.Created(submission.id)
            every { submissionRepository.findById(submission.id) } returns submission

            sut.handle(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission),
                )
            }
            verify { broadcastProducer.produce(GuestDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(submission.contest.id).buildSubmissionCreatedEvent(submission)) }
            verify { submissionQueueProducer.produce(submission) }
        }

        test("should not produce to submission queue if auto judge is disabled") {
            val contest = ContestMockBuilder.build()
            contest.settings.isAutoJudgeEnabled = false
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val event = SubmissionEvent.Created(submission.id)
            every { submissionRepository.findById(submission.id) } returns submission

            sut.handle(event)

            verify(exactly = 0) {
                submissionQueueProducer.produce(submission)
            }
        }
    })
