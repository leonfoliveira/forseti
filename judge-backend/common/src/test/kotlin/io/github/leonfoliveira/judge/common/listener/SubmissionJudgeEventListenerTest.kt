package io.github.leonfoliveira.judge.common.listener

import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.port.SubmissionQueueProducer
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

        test("should enqueue submission on event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionAutoJudgeEvent(this, submission)

            sut.onApplicationEvent(event)

            verify { submissionQueueProducer.produce(submission) }
        }
    })
