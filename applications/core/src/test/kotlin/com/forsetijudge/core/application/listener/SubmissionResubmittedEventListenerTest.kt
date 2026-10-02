package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class SubmissionResubmittedEventListenerTest {
    private val submissions = mock<SubmissionRepository>()
    private val producer = mock<SubmissionQueueProducer>()
    private val listener = SubmissionResubmittedEventListener(submissions, producer)

    @Test
    fun `queues a resubmitted submission for judging`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val submission = MockEntityFactory.submission(member = member, problem = problem)
        whenever(submissions.findById(submission.id)).thenReturn(submission)

        listener.handle(SubmissionEvent.Resubmitted(submission.id))

        verify(producer).produce(
            SubmissionQueueProducer.Message(
                contest.id,
                submission.id,
                submission.language,
                submission.code.id,
                submission.code.filename,
                problem.timeLimitMs,
                problem.memoryLimitMb,
                problem.testCases.id,
            ),
        )
    }

    @Test
    fun `does not queue a missing submission`() {
        val submissionId = UUID.randomUUID()
        whenever(submissions.findById(submissionId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            listener.handle(SubmissionEvent.Resubmitted(submissionId))
        }
        verify(producer, never()).produce(any())
    }
}
