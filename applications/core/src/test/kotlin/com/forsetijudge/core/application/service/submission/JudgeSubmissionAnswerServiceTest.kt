package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.MetricsCollector
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.port.output.repository.ExecutionRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class JudgeSubmissionAnswerServiceTest {
    private val submissionRepository = mock<SubmissionRepository>()
    private val executionRepository = mock<ExecutionRepository>()
    private val businessEventPublisher = mock<BusinessEventPublisher>()
    private val metricsCollector = mock<MetricsCollector>()
    private val service =
        JudgeSubmissionAnswerService(
            submissionRepository,
            executionRepository,
            businessEventPublisher,
            metricsCollector,
        )

    val command =
        JudgeSubmissionUseCase.Command(
            submissionId = MockEntityFactory.submission().id,
            answer = Submission.Answer.ACCEPTED,
            totalTestCases = 10,
            approvedTestCases = 10,
            maxCpuTimeMs = 1000L,
            maxClockTimeMs = 2000L,
            maxPeakMemoryKb = 3000L,
            detailsId = MockEntityFactory.attachment().id,
        )

    @Test
    fun `judges a pending submission and publishes update`() {
        val submission = MockEntityFactory.submission(status = Submission.Status.JUDGING, answer = null)
        whenever(submissionRepository.findByIdNullable(command.submissionId)).thenReturn(submission)

        service.execute(command)

        assertEquals(Submission.Status.JUDGED, submission.status)
        assertEquals(Submission.Answer.ACCEPTED, submission.answer)
        verify(submissionRepository).saveAndFlush(submission)
        verify(businessEventPublisher).publish(SubmissionEvent.Updated(submission.id))
        verify(executionRepository).saveAndFlush(any())
    }

    @Test
    fun `rejects missing or already judged submission`() {
        whenever(submissionRepository.findByIdNullable(command.submissionId)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(command)
        }

        val judged = MockEntityFactory.submission(status = Submission.Status.JUDGED)
        whenever(submissionRepository.findByIdNullable(command.submissionId)).thenReturn(judged)
        assertThrows(ForbiddenException::class.java) {
            service.execute(command)
        }
        verify(submissionRepository, never()).saveAndFlush(any())
    }
}
