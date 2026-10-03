package com.forsetijudge.core.api.websocket.middleware

import com.corundumstudio.socketio.HandshakeData
import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import io.netty.handler.codec.http.DefaultHttpHeaders
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.OffsetDateTime
import java.util.UUID

class SocketIORoomAuthorizationFilterTest {
    private val findSession = mock<FindSessionByIdUseCase>()
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val filter = SocketIORoomAuthorizationFilter(findSession, contests, members)
    private val client = mock<SocketIOClient>()
    private val handshake = mock<HandshakeData>()

    init {
        whenever(client.handshakeData).thenReturn(handshake)
        whenever(handshake.httpHeaders).thenReturn(DefaultHttpHeaders())
    }

    @Test
    fun `allows contest admin into admin dashboard using session cookie`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)
        val session = MockModelFactory.session(member = MockModelFactory.sessionMember(id = member.id))
        whenever(client.handshakeData).thenReturn(handshake)
        whenever(handshake.httpHeaders).thenReturn(
            DefaultHttpHeaders().set("Cookie", "other=value; ${SessionCookieBuilder.SESSION_COOKIE_NAME}=${session.id}"),
        )
        whenever(findSession.execute(FindSessionByIdUseCase.Command(session.id))).thenReturn(session)
        whenever(members.findById(member.id)).thenReturn(member)
        whenever(contests.findById(contest.id)).thenReturn(contest)

        filter.authorize(client, "/contests/${contest.id}/dashboard/admin")

        verify(findSession).execute(FindSessionByIdUseCase.Command(session.id))
        verify(members).findById(member.id)
    }

    @Test
    fun `denies missing or invalid authentication for protected dashboard`() {
        whenever(handshake.httpHeaders).thenReturn(DefaultHttpHeaders().set("Cookie", "session_id=bad-uuid"))
        val contest = MockEntityFactory.contest()
        whenever(contests.findById(contest.id)).thenReturn(contest)

        assertThrows(ForbiddenException::class.java) {
            filter.authorize(client, "/contests/${contest.id}/dashboard/admin")
        }

        verify(findSession, never()).execute(any())
        verify(members, never()).findById(any())
    }

    @Test
    fun `denies member type that does not match requested dashboard`() {
        val contest = MockEntityFactory.contest()
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findById(contestant.id)).thenReturn(contestant)
        authenticateAs(contestant)

        assertThrows(ForbiddenException::class.java) {
            filter.authorize(client, "/contests/${contest.id}/dashboard/judge")
        }
    }

    @Test
    fun `requires started contest for contestant and guest dashboards`() {
        val contest =
            MockEntityFactory.contest(
                startAt = OffsetDateTime.now().plusHours(1),
            )
        whenever(contests.findById(contest.id)).thenReturn(contest)
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        whenever(members.findById(contestant.id)).thenReturn(contestant)
        authenticateAs(contestant)

        assertThrows(ForbiddenException::class.java) {
            filter.authorize(client, "/contests/${contest.id}/dashboard/contestant")
        }
        assertThrows(ForbiddenException::class.java) {
            filter.authorize(client, "/contests/${contest.id}/dashboard/guest")
        }
    }

    @Test
    fun `allows guest dashboard after contest starts without authentication`() {
        val contest = MockEntityFactory.contest()
        whenever(contests.findById(contest.id)).thenReturn(contest)

        filter.authorize(client, "/contests/${contest.id}/dashboard/guest")

        verify(findSession, never()).execute(any())
        verify(members, never()).findById(any())
    }

    @Test
    fun `only allows contestant to join their own private room`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val contestant = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findById(contestant.id)).thenReturn(contestant)
        authenticateAs(contestant)

        filter.authorize(client, "/contests/${contest.id}/members/${contestant.id}/private/contestant")
        assertThrows(ForbiddenException::class.java) {
            filter.authorize(client, "/contests/${contest.id}/members/${UUID.randomUUID()}/private/contestant")
        }
    }

    @Test
    fun `reports missing contest and unknown room`() {
        val contestId = UUID.randomUUID()
        whenever(contests.findById(contestId)).thenReturn(null)
        whenever(handshake.httpHeaders).thenReturn(DefaultHttpHeaders())

        assertThrows(NotFoundException::class.java) {
            filter.authorize(client, "/contests/$contestId/dashboard/guest")
        }
        assertThrows(ForbiddenException::class.java) {
            filter.authorize(client, "/unknown-room")
        }
    }

    private fun authenticateAs(member: Member) {
        val session = MockModelFactory.session(member = MockModelFactory.sessionMember(id = member.id))
        whenever(handshake.httpHeaders).thenReturn(
            DefaultHttpHeaders().set("Cookie", "${SessionCookieBuilder.SESSION_COOKIE_NAME}=${session.id}"),
        )
        whenever(findSession.execute(eq(FindSessionByIdUseCase.Command(session.id)))).thenReturn(session)
    }
}
