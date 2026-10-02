package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.test.factory.MockEntityFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class FailSubmissionServiceTest {
    private val submissions = mock<SubmissionRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = FailSubmissionService(submissions, events)

    @Test
    fun `marks judging submission as failed`() {
        val submission = MockEntityFactory.submission(status = Submission.Status.JUDGING, answer = null)
        whenever(submissions.findById(submission.id)).thenReturn(submission)

        service.execute(FailSubmissionUseCase.Command(submission.id))

        assertEquals(Submission.Status.FAILED, submission.status)
        verify(submissions).save(submission)
        verify(events).publish(SubmissionEvent.Created(submission.id))
    }

    @Test
    fun `does nothing if submission is not judging and errors when missing`() {
        val judged = MockEntityFactory.submission(status = Submission.Status.JUDGED)
        whenever(submissions.findById(judged.id)).thenReturn(judged)
        service.execute(FailSubmissionUseCase.Command(judged.id))
        verify(submissions, never()).save(any())
        verify(events, never()).publish(any())

        val missingId = java.util.UUID.randomUUID()
        whenever(submissions.findById(missingId)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(FailSubmissionUseCase.Command(missingId))
        }
    }
}
