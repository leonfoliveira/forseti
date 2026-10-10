package com.forsetijudge.core.api.listener.submission

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.output.repository.SubmissionRepository
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
import java.util.UUID

class ApiSubmissionCreatedEventListenerTest {
    private val submissions = mock<SubmissionRepository>()
    private val producer = mock<SocketIOFanoutRedisMessageProducer>()
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

        val messages = argumentCaptor<SocketIOFanoutMessage>()
        verify(producer, times(4)).produce(messages.capture())
        assertEquals(
            listOf(
                "/contests/${contest.id}/dashboard/admin",
                "/contests/${contest.id}/dashboard/contestant",
                "/contests/${contest.id}/dashboard/guest",
                "/contests/${contest.id}/dashboard/judge",
            ),
            messages.allValues.map(SocketIOFanoutMessage::room),
        )
        assertEquals(List(4) { "SUBMISSION_CREATED" }, messages.allValues.map(SocketIOFanoutMessage::eventName))
        assertTrue(messages.allValues[0].data is SubmissionWithCodeAndExecutionsResponseBodyDTO)
        assertTrue(messages.allValues[1].data is SubmissionResponseBodyDTO)
        assertTrue(messages.allValues[2].data is SubmissionResponseBodyDTO)
        assertTrue(messages.allValues[3].data is SubmissionWithCodeAndExecutionsResponseBodyDTO)
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
