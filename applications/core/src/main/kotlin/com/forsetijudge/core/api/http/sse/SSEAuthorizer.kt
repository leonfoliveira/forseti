package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SSEAuthorizer(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
) {
    /**
     * Authorizes the current user to access the admin dashboard room of a contest.
     *
     * @param contestId The ID of the contest for which access is being requested.
     * @throws NotFoundException if the contest or member is not found.
     * @throws ForbiddenException if the member does not have the required permissions.
     */
    @Transactional(readOnly = true)
    fun authorizeToAdminDashboardRoom(contestId: UUID) {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        val contest =
            contestRepository.findById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()
    }

    /**
     * Authorizes the current user to access the judge dashboard room of a contest.
     *
     * @param contestId The ID of the contest for which access is being requested.
     * @throws NotFoundException if the contest or member is not found.
     * @throws ForbiddenException if the member does not have the required permissions.
     */
    @Transactional(readOnly = true)
    fun authorizeToJudgeDashboardRoom(contestId: UUID) {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        val contest =
            contestRepository.findById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val member =
            memberRepository.findByIdAndContestId(contextMemberId, contestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.JUDGE)
            .throwIfErrors()
    }

    /**
     * Authorizes the current user to access the contestant dashboard room of a contest.
     *
     * @param contestId The ID of the contest for which access is being requested.
     * @throws NotFoundException if the contest or member is not found.
     * @throws ForbiddenException if the member does not have the required permissions.
     */
    @Transactional(readOnly = true)
    fun authorizeToContestantDashboardRoom(contestId: UUID) {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        val contest =
            contestRepository.findById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val member =
            memberRepository.findByIdAndContestId(contextMemberId, contestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .requireContestStarted()
            .throwIfErrors()
    }

    /**
     * Authorizes to access the guest dashboard room of a contest.
     *
     * @param contestId The ID of the contest for which access is being requested.
     * @throws NotFoundException if the contest is not found.
     * @throws ForbiddenException if the guest does not have the required permissions.
     */
    @Transactional(readOnly = true)
    fun authorizeToGuestDashboardRoom(contestId: UUID) {
        val contest =
            contestRepository.findById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")

        ContestAuthorizer(contest, null)
            .requireContestStarted()
            .throwIfErrors()
    }

    /**
     * Authorizes the current user to access their private room.
     *
     * @param memberId The ID of the member for which access is being requested.
     * @throws ForbiddenException if the member does not have the required permissions.
     */
    @Transactional(readOnly = true)
    fun authorizeToMemberPrivateRoom(memberId: UUID) {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        if (contextMemberId != memberId) {
            throw ForbiddenException("You are not authorized to access this private room.")
        }
    }
}
