package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionResetEventListenerTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val submissionQueueProducer = mockk<SubmissionQueueProducer>(relaxed = true)

        val sut =
            SubmissionResetEventListener(
                submissionRepository = submissionRepository,
                submissionQueueProducer = submissionQueueProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionEvent.Reset(submission.id)
            every { submissionRepository.findById(submission.id) } returns submission

            sut.handle(event)

            verify { submissionQueueProducer.produce(submission) }
        }

        test("should not produce to submission queue if auto judge is disabled") {
            val contest = ContestMockBuilder.build()
            contest.settings.isAutoJudgeEnabled = false
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val event = SubmissionEvent.Reset(submission.id)
            every { submissionRepository.findById(submission.id) } returns submission

            sut.handle(event)

            verify(exactly = 0) { submissionQueueProducer.produce(submission) }
        }
    })
