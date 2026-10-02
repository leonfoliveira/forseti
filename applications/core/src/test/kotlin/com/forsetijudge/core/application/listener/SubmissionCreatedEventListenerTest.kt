package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class SubmissionCreatedEventListenerTest {
    private val submissions = mock<SubmissionRepository>()
    private val producer = mock<SubmissionQueueProducer>()
    private val listener = SubmissionCreatedEventListener(submissions, producer)

    @Test
    fun `publishes judge message with submission and problem metadata`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val submission = MockEntityFactory.submission(member = member, problem = problem)
        whenever(submissions.findById(submission.id)).thenReturn(submission)

        listener.handle(SubmissionEvent.Created(submission.id))

        verify(producer).produce(
            SubmissionQueueProducer.Message(
                contestId = contest.id,
                submissionId = submission.id,
                language = submission.language,
                codeId = submission.code.id,
                codeFilename = submission.code.filename,
                timeLimitMs = problem.timeLimitMs,
                memoryLimitMb = problem.memoryLimitMb,
                testCasesId = problem.testCases.id,
            ),
        )
    }

    @Test
    fun `throws when submission does not exist`() {
        val submissionId = UUID.randomUUID()
        whenever(submissions.findById(submissionId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            listener.handle(SubmissionEvent.Created(submissionId))
        }

        verify(producer, never()).produce(any())
    }
}
