package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.event.SubmissionRerunEvent
import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class SubmissionJudgeEventListenerTest :
    FunSpec({
        val submissionQueueProducer = mockk<SubmissionQueueProducer>(relaxed = true)

        val sut = SubmissionEventsListener(submissionQueueProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should publish submission on create event") {
            val contest = ContestMockBuilder.build(settings = Contest.Settings(isAutoJudgeEnabled = true))
            val submission = SubmissionMockBuilder.build(problem = ProblemMockBuilder.build(contest = contest))
            val event = SubmissionCreatedEvent(this, submission)

            sut.onApplicationEvent(event)

            verify { submissionQueueProducer.produce(submission) }
        }

        test("should not publish submission if auto judge is disabled") {
            val contest = ContestMockBuilder.build(settings = Contest.Settings(isAutoJudgeEnabled = false))
            val submission = SubmissionMockBuilder.build(problem = ProblemMockBuilder.build(contest = contest))
            val event = SubmissionCreatedEvent(this, submission)

            sut.onApplicationEvent(event)

            verify(exactly = 0) { submissionQueueProducer.produce(submission) }
        }

        test("should publish submission on rerun event") {
            val contest = ContestMockBuilder.build(settings = Contest.Settings(isAutoJudgeEnabled = true))
            val submission = SubmissionMockBuilder.build(problem = ProblemMockBuilder.build(contest = contest))
            val event = SubmissionRerunEvent(this, submission)

            sut.onApplicationEvent(event)

            verify { submissionQueueProducer.produce(submission) }
        }

        test("should not publish submission on rerun event if auto judge is disabled") {
            val contest = ContestMockBuilder.build(settings = Contest.Settings(isAutoJudgeEnabled = false))
            val submission = SubmissionMockBuilder.build(problem = ProblemMockBuilder.build(contest = contest))
            val event = SubmissionRerunEvent(this, submission)

            sut.onApplicationEvent(event)

            verify(exactly = 0) { submissionQueueProducer.produce(submission) }
        }
    })
