package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.producer.payload.SubmissionQueuePayload
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class SubmissionResetEventListenerTest :
    FunSpec({
        val submissionQueueProducer = mockk<SubmissionQueueProducer>(relaxed = true)

        val sut =
            SubmissionResetEventListener(
                submissionQueueProducer = submissionQueueProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionEvent.Reset(submission)

            sut.onApplicationEvent(event)

            verify {
                submissionQueueProducer.produce(SubmissionQueuePayload(submissionId = submission.id))
            }
        }

        test("should not produce to submission queue if auto judge is disabled") {
            val contest = ContestMockBuilder.build()
            contest.settings.isAutoJudgeEnabled = false
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val event = SubmissionEvent.Reset(submission)

            sut.onApplicationEvent(event)

            verify(exactly = 0) {
                submissionQueueProducer.produce(SubmissionQueuePayload(submissionId = submission.id))
            }
        }
    })
