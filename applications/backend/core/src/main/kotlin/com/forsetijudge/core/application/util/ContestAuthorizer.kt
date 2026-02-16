package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import kotlin.collections.contains

/**
 * Utility class for authorization checks related to contests and members.
 *
 * @param contest The contest for which the authorization checks are being performed.
 * @param member The member for whom the authorization checks are being performed.
 */
class ContestAuthorizer(
    private val contest: Contest,
    private val member: Member? = null,
) {
    /**
     * Checks if the contest has started.
     * If the contest has not started yet, only ROOT, ADMIN and JUDGE members can access it.
     *
     * @param contest The contest to check.
     * @param member The member who is trying to access the contest. Can be null if the member is not authenticated.
     * @throws ForbiddenException if the contest has not started yet and the member is not ROOT, ADMIN or JUDGE.
     */
    fun checkContestStarted(): ContestAuthorizer {
        if (setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE).contains(member?.type) || member?.isSystemMember() == true) {
            return this
        }

        if (!contest.hasStarted()) {
            throw ForbiddenException("Contest has not started yet")
        }
        return this
    }

    /**
     * Checks if the member has one of the allowed types.
     *
     * @param member The member to check.
     * @param allowedTypes The set of allowed member types.
     * @throws ForbiddenException if the member's type is not in the set of allowed types
     */
    fun checkMemberType(vararg allowedTypes: Member.Type): ContestAuthorizer {
        if (!allowedTypes.contains(member?.type)) {
            throw ForbiddenException("Member type ${member?.type} is not allowed to perform this action")
        }
        return this
    }
}
