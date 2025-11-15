package io.github.leonfoliveira.forseti.common.application.listener

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionRerunEvent
import io.github.leonfoliveira.forseti.common.application.port.driven.SubmissionQueueProducer
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
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
