package com.forsetijudge.core.api.listener.submission

import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutMessage
import com.forsetijudge.core.api.websocket.fanout.SocketIOFanoutRedisMessageProducer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardCellBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardCellResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.output.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime
import java.util.UUID

class ApiSubmissionUpdatedEventListenerTest {
    private val submissions = mock<SubmissionRepository>()
    private val cellBuilder =
        LeaderboardCellBuilder()
    private val producer = mock<SocketIOFanoutRedisMessageProducer>()
    private val cache = mock<LeaderboardCacheStore>()
    private val listener = ApiSubmissionUpdatedEventListener(submissions, cellBuilder, producer, cache)

    @Test
    fun `fans out submission and leaderboard update and caches recomputed cell`() {
        val startAt = OffsetDateTime.now().minusHours(1)
        val contest = MockEntityFactory.contest(startAt = startAt)
        val member = MockEntityFactory.member(contest = contest)
        val problem = MockEntityFactory.problem(contest = contest)
        val submission =
            MockEntityFactory.submission(
                member = member,
                problem = problem,
                createdAt = startAt.plusMinutes(15),
                answer = Submission.Answer.ACCEPTED,
            )
        val memberSubmissions = listOf(submission)
        whenever(submissions.findById(submission.id)).thenReturn(submission)
        whenever(
            submissions.findAllByMemberIdAndProblemIdAndStatus(
                memberId = member.id,
                problemId = problem.id,
                status = Submission.Status.JUDGED,
            ),
        ).thenReturn(memberSubmissions)

        listener.handle(SubmissionEvent.Updated(submission.id))

        val messages = argumentCaptor<SocketIOFanoutMessage>()
        verify(producer, times(9)).produce(messages.capture())
        val expectedRooms =
            listOf(
                "/contests/${contest.id}/dashboard/admin",
                "/contests/${contest.id}/dashboard/judge",
                "/contests/${contest.id}/members/${member.id}/private/contestant",
                "/contests/${contest.id}/dashboard/contestant",
                "/contests/${contest.id}/dashboard/guest",
                "/contests/${contest.id}/dashboard/admin",
                "/contests/${contest.id}/dashboard/contestant",
                "/contests/${contest.id}/dashboard/guest",
                "/contests/${contest.id}/dashboard/judge",
            )
        assertEquals(expectedRooms, messages.allValues.map(SocketIOFanoutMessage::room))
        assertEquals(
            listOf(
                "SUBMISSION_UPDATED",
                "SUBMISSION_UPDATED",
                "SUBMISSION_UPDATED",
                "SUBMISSION_UPDATED",
                "SUBMISSION_UPDATED",
                "LEADERBOARD_UPDATED",
                "LEADERBOARD_UPDATED",
                "LEADERBOARD_UPDATED",
                "LEADERBOARD_UPDATED",
            ),
            messages.allValues.map(SocketIOFanoutMessage::eventName),
        )
        assertTrue(messages.allValues[0].data is SubmissionWithCodeAndExecutionsResponseBodyDTO)
        assertTrue(messages.allValues[2].data is SubmissionWithCodeAndExecutionsResponseBodyDTO)
        assertTrue(messages.allValues[3].data is SubmissionResponseBodyDTO)
        assertTrue(messages.allValues[4].data is SubmissionResponseBodyDTO)
        assertTrue(messages.allValues.drop(5).all { it.data is LeaderboardCellResponseBodyDTO })

        val cellCaptor = argumentCaptor<Leaderboard.Cell>()
        verify(cache).cacheCell(eq(contest.id), cellCaptor.capture())
        assertEquals(member.id, cellCaptor.firstValue.memberId)
        assertEquals(problem.id, cellCaptor.firstValue.problemId)
        assertTrue(cellCaptor.firstValue.isAccepted)
    }

    @Test
    fun `throws for missing submission without fanout or cache update`() {
        val submissionId = UUID.randomUUID()
        whenever(submissions.findById(submissionId)).thenReturn(null)

        assertThrows(NotFoundException::class.java) {
            listener.handle(SubmissionEvent.Updated(submissionId))
        }

        verify(producer, never()).produce(any())
        verify(cache, never()).cacheCell(any(), any())
    }
}
