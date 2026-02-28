package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [SubmissionResetEventListener::class])
class SubmissionResetEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val submissionQueueProducer: SubmissionQueueProducer,
    private val sut: SubmissionResetEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionEvent.Reset(submission)

            sut.onApplicationEvent(event)

            verify {
                submissionQueueProducer.produce(submission)
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
                submissionQueueProducer.produce(submission)
            }
        }
    })
