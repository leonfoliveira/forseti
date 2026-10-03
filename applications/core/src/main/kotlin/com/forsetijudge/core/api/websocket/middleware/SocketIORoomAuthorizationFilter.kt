package com.forsetijudge.core.api.websocket.middleware

import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Authorizes whether the client behind a websocket connection is allowed to join a given room.
 *
 * Rooms are defined in [com.forsetijudge.core.api.websocket.room], and this filter mirrors the same
 * authorization rules enforced for their HTTP counterparts (see the `dashboard` services), namely:
 * - The member type must be compatible with the room being joined.
 * - The contest referenced by the room must have started, when required.
 * - The member referenced by the room (for private rooms) must match the logged-in member.
 */
@Component
class SocketIORoomAuthorizationFilter(
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) {
    private val logger = SafeLogger(this::class)

    companion object {
        private const val UUID_PATTERN = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
    }

    private val adminDashboardRoomRegex = Regex("^/contests/($UUID_PATTERN)/dashboard/admin$")
    private val judgeDashboardRoomRegex = Regex("^/contests/($UUID_PATTERN)/dashboard/judge$")
    private val contestantDashboardRoomRegex = Regex("^/contests/($UUID_PATTERN)/dashboard/contestant$")
    private val guestDashboardRoomRegex = Regex("^/contests/($UUID_PATTERN)/dashboard/guest$")
    private val contestantPrivateRoomRegex =
        Regex("^/contests/($UUID_PATTERN)/members/($UUID_PATTERN)/private/contestant$")

    /**
     * Authorizes the given client to join the given room, throwing a
     * [com.forsetijudge.core.domain.exception.BusinessException] when the client is not allowed to do so.
     *
     * @param client The client requesting to join the room.
     * @param roomName The name of the room being joined.
     */
    @Transactional(readOnly = true)
    fun authorize(
        client: SocketIOClient,
        roomName: String,
    ) {
        val member = resolveMember(client)

        adminDashboardRoomRegex.find(roomName)?.let {
            authorizeAdminDashboard(contestId = UUID.fromString(it.groupValues[1]), member = member)
            return
        }

        judgeDashboardRoomRegex.find(roomName)?.let {
            authorizeJudgeDashboard(contestId = UUID.fromString(it.groupValues[1]), member = member)
            return
        }

        contestantDashboardRoomRegex.find(roomName)?.let {
            authorizeContestantDashboard(contestId = UUID.fromString(it.groupValues[1]), member = member)
            return
        }

        guestDashboardRoomRegex.find(roomName)?.let {
            authorizeGuestDashboard(contestId = UUID.fromString(it.groupValues[1]))
            return
        }

        contestantPrivateRoomRegex.find(roomName)?.let {
            authorizeContestantPrivate(
                contestId = UUID.fromString(it.groupValues[1]),
                targetMemberId = UUID.fromString(it.groupValues[2]),
                member = member,
            )
            return
        }

        throw ForbiddenException("Unknown room: $roomName")
    }

    private fun authorizeAdminDashboard(
        contestId: UUID,
        member: Member?,
    ) {
        val contest = findContest(contestId)
        val resolvedMember = requireMember(member)

        ContestAuthorizer(contest, resolvedMember)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()
    }

    private fun authorizeJudgeDashboard(
        contestId: UUID,
        member: Member?,
    ) {
        val contest = findContest(contestId)
        val resolvedMember = requireMember(member)

        ContestAuthorizer(contest, resolvedMember)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.JUDGE)
            .throwIfErrors()
    }

    private fun authorizeContestantDashboard(
        contestId: UUID,
        member: Member?,
    ) {
        val contest = findContest(contestId)
        val resolvedMember = requireMember(member)

        ContestAuthorizer(contest, resolvedMember)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .requireContestStarted()
            .throwIfErrors()
    }

    private fun authorizeGuestDashboard(contestId: UUID) {
        val contest = findContest(contestId)

        ContestAuthorizer(contest)
            .requireContestStarted()
            .throwIfErrors()
    }

    private fun authorizeContestantPrivate(
        contestId: UUID,
        targetMemberId: UUID,
        member: Member?,
    ) {
        val contest = findContest(contestId)
        val resolvedMember = requireMember(member)

        ContestAuthorizer(contest, resolvedMember)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .throwIfErrors()

        if (resolvedMember.id != targetMemberId) {
            throw ForbiddenException("Member is not allowed to join another member's private room")
        }
    }

    private fun findContest(contestId: UUID) =
        contestRepository.findById(contestId)
            ?: throw NotFoundException("Could not find contest with id $contestId")

    private fun requireMember(member: Member?): Member = member ?: throw ForbiddenException("Not authenticated")

    /**
     * Resolves the logged-in member behind the given client, based on the session cookie sent during
     * the websocket handshake. Returns null when there is no session or it is invalid/expired.
     */
    private fun resolveMember(client: SocketIOClient): Member? {
        val sessionId = extractSessionId(client) ?: return null

        return try {
            val session = findSessionByIdUseCase.execute(FindSessionByIdUseCase.Command(sessionId = sessionId))
            memberRepository.findById(session.member.id)
        } catch (exception: Exception) {
            logger.info("Could not resolve session from websocket handshake: ${exception.message}")
            null
        }
    }

    private fun extractSessionId(client: SocketIOClient): UUID? {
        val cookieHeader = client.handshakeData.httpHeaders?.get("Cookie") ?: return null

        val rawSessionId =
            cookieHeader
                .split(";")
                .map { it.trim() }
                .firstOrNull { it.startsWith("${SessionCookieBuilder.SESSION_COOKIE_NAME}=") }
                ?.substringAfter("=")
                ?: return null

        return try {
            UUID.fromString(rawSessionId)
        } catch (exception: IllegalArgumentException) {
            null
        }
    }
}
