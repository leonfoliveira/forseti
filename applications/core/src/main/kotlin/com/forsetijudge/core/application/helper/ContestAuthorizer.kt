package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.InternalServerException

class ContestAuthorizer(
    private val contest: Contest,
    private val member: Member? = null,
) {
    private val errors = mutableListOf<String>()

    private fun append(error: String): ContestAuthorizer {
        errors.add(error)
        return this
    }

    private fun append(errors: List<String>): ContestAuthorizer {
        this.errors.addAll(errors)
        return this
    }

    fun throwIfErrors() {
        if (errors.isNotEmpty()) {
            throw ForbiddenException(errors.joinToString("\n"))
        }
    }

    fun or(vararg contestAuthorizers: (contestAuthorizer: ContestAuthorizer) -> ContestAuthorizer): ContestAuthorizer {
        val allErrors = mutableListOf<String>()
        for (contestAuthorizer in contestAuthorizers) {
            val current = ContestAuthorizer(contest, member)
            val errors = contestAuthorizer(current).errors
            if (errors.isEmpty()) {
                return this
            }
            allErrors.addAll(errors)
        }
        append(allErrors)
        return this
    }

    fun requireContestNotStarted(): ContestAuthorizer {
        if (contest.hasStarted()) {
            return append("Contest has already started")
        }
        return this
    }

    fun requireContestStarted(): ContestAuthorizer {
        if (!contest.hasStarted()) {
            return append("Contest has not started yet")
        }
        return this
    }

    fun requireContestNotEnded(): ContestAuthorizer {
        if (contest.hasEnded()) {
            return append("Contest has ended")
        }
        return this
    }

    fun requireContestActive(): ContestAuthorizer {
        if (!contest.isActive()) {
            return append("Contest is not active")
        }
        return this
    }

    fun requireMemberToBelong(): ContestAuthorizer {
        if (member == null) {
            throw InternalServerException("Member is required to perform this action")
        }

        if (member.contest != null && member.contest != contest) {
            return append("Member does not belong to this contest")
        }
        return this
    }

    fun requireMemberType(vararg allowedTypes: Member.Type): ContestAuthorizer {
        if (!allowedTypes.contains(member?.type)) {
            return append("Member type ${member?.type} is not allowed to perform this action")
        }
        return this
    }

    fun requireMemberCanAccessNotStartedContest(): ContestAuthorizer {
        if (member == null) {
            throw InternalServerException("Member is required to perform this action")
        }

        if (member.type !in
            setOf(
                Member.Type.ROOT,
                Member.Type.ADMIN,
                Member.Type.JUDGE,
            )
        ) {
            return append("Member cannot access this contest before it starts")
        }
        return this
    }
}
