package live.forseti.core.application.listener

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.Contest
import live.forseti.core.domain.entity.ContestMockBuilder
import live.forseti.core.domain.entity.ProblemMockBuilder
import live.forseti.core.domain.entity.SubmissionMockBuilder
import live.forseti.core.domain.event.SubmissionCreatedEvent
import live.forseti.core.domain.event.SubmissionRerunEvent
import live.forseti.core.port.driven.SubmissionQueueProducer

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
