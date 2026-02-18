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
     * If the contest has not started yet, only ROOT, ADMIN, STAFF and JUDGE members can access it.
     *
     * @throws ForbiddenException if the contest has not started yet and the member is not ROOT, ADMIN or JUDGE.
     */
    fun checkContestStarted(): ContestAuthorizer {
        if (setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF, Member.Type.JUDGE).contains(member?.type) ||
            member?.isSystemMember() == true
        ) {
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
     * @param allowedTypes The set of allowed member types.
     * @throws ForbiddenException if the member's type is not in the set of allowed types
     */
    fun checkMemberType(vararg allowedTypes: Member.Type): ContestAuthorizer {
        if (!allowedTypes.contains(member?.type)) {
            throw ForbiddenException("Member type ${member?.type} is not allowed to perform this action")
        }
        return this
    }

    /**
     * Checks if the member is authenticated (i.e., not null).
     *
     * @throws ForbiddenException if the member is null (not authenticated)
     */
    fun checkAnyMember(): ContestAuthorizer {
        if (member == null) {
            throw ForbiddenException("Authentication is required to perform this action")
        }
        return this
    }
}
