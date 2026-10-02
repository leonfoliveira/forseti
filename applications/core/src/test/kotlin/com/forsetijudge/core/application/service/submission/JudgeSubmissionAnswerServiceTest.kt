package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
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

class JudgeSubmissionAnswerServiceTest {
    private val submissions = mock<SubmissionRepository>()
    private val events = mock<BusinessEventPublisher>()
    private val service = JudgeSubmissionAnswerService(submissions, events)

    @Test
    fun `judges a pending submission and publishes update`() {
        val submission = MockEntityFactory.submission(status = Submission.Status.JUDGING, answer = null)
        whenever(submissions.findById(submission.id)).thenReturn(submission)

        service.execute(JudgeSubmissionUseCase.Command(submission.id, Submission.Answer.ACCEPTED))

        assertEquals(Submission.Status.JUDGED, submission.status)
        assertEquals(Submission.Answer.ACCEPTED, submission.answer)
        verify(submissions).save(submission)
        verify(events).publish(SubmissionEvent.Updated(submission.id))
    }

    @Test
    fun `rejects missing or already judged submission`() {
        val missing = MockEntityFactory.submission()
        whenever(submissions.findById(missing.id)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(JudgeSubmissionUseCase.Command(missing.id, Submission.Answer.ACCEPTED))
        }

        val judged = MockEntityFactory.submission(status = Submission.Status.JUDGED)
        whenever(submissions.findById(judged.id)).thenReturn(judged)
        assertThrows(ForbiddenException::class.java) {
            service.execute(JudgeSubmissionUseCase.Command(judged.id, Submission.Answer.ACCEPTED))
        }
        verify(submissions, never()).save(any())
    }
}
