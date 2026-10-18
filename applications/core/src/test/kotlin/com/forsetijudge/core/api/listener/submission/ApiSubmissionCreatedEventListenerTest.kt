package com.forsetijudge.core.api.listener.submission

import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutMessage
import com.forsetijudge.core.api.http.sse.fanout.SSEFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseDTO
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApiSubmissionCreatedEventListenerTest {
    private val submissions = mock<SubmissionRepository>()
    private val producer = mock<SSEFanoutRedisMessageProducer>()
    private val listener = ApiSubmissionCreatedEventListener(submissions, producer)

    @Test
    fun `fans out submission created event to all dashboard rooms`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val submission =
            MockEntityFactory.submission(
                member = member,
                problem = MockEntityFactory.problem(contest = contest),
            )
        whenever(submissions.findById(submission.id)).thenReturn(submission)

        listener.handle(SubmissionEvent.Created(submission.id))

        val messages = argumentCaptor<SSEFanoutMessage>()
        verify(producer, times(5)).produce(messages.capture())
        assertEquals(
            listOf(
                "admin-dashboard-${contest.id}",
                "judge-dashboard-${contest.id}",
                "staff-dashboard-${contest.id}",
                "contestant-dashboard-${contest.id}",
                "guest-dashboard-${contest.id}",
            ),
            messages.allValues.map(SSEFanoutMessage::room),
        )
        assertEquals(List(5) { "SUBMISSION_CREATED" }, messages.allValues.map(SSEFanoutMessage::eventName))
        assertTrue(messages.allValues[0].data is SubmissionWithCodeAndExecutionsResponseDTO)
        assertTrue(messages.allValues[1].data is SubmissionWithCodeAndExecutionsResponseDTO)
        assertTrue(messages.allValues[2].data is SubmissionWithCodeResponseDTO)
        assertTrue(messages.allValues[3].data is SubmissionResponseDTO)
        assertTrue(messages.allValues[4].data is SubmissionResponseDTO)
    }

    @Test
    fun `throws when submission cannot be found`() {
        val submissionId = UUID.randomUUID()
        whenever(submissions.findById(submissionId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            listener.handle(SubmissionEvent.Created(submissionId))
        }
        verify(producer, never()).produce(any())
    }
}
