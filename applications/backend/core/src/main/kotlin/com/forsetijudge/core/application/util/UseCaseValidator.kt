package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException

object UseCaseValidator {
    /**
     * Validates that a member belongs to a contest.
     * ROOT members are always valid.
     *
     * @param contest The contest to validate against.
     * @param member The member to validate.
     * @throws ForbiddenException if the member does not belong to the contest.
     */
    fun validateMemberInContest(
        contest: Contest,
        member: Member,
    ) {
        if (member.type == Member.Type.ROOT) {
            return
        }

        if (member.contest?.id != contest.id) {
            throw ForbiddenException("Member with id ${member.id} does not belong to contest with id ${contest.id}")
        }
    }

    /**
     * Validates that a member has one of the allowed types.
     * ROOT members are always valid.
     *
     * @param member The member to validate.
     * @param allowedTypes The set of allowed member types.
     * @throws ForbiddenException if the member does not have one of the allowed types.
     */
    fun validateMemberType(
        member: Member,
        allowedTypes: Set<Member.Type>,
    ) {
        if (member.type == Member.Type.ROOT) {
            return
        }

        if (member.type !in allowedTypes) {
            throw ForbiddenException("Member with id ${member.id} does not have required permissions")
        }
    }
}
