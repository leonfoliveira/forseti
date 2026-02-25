package com.forsetijudge.core.port.driven.broadcast

import java.util.UUID

open class BroadcastTopic(
    val name: String,
) {
    companion object {
        val CONTESTS_REGEX = Regex("/contests/(?<contestId>[a-f0-9\\-]+).*")
        val CONTESTS_MEMBERS_REGEX = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/members/(?<memberId>[a-f0-9\\-]+).*")

        fun extractContestId(topicName: String): UUID? =
            extractPathVariable(CONTESTS_REGEX, topicName, "contestId")?.let { contestIdString ->
                try {
                    UUID.fromString(contestIdString)
                } catch (e: IllegalArgumentException) {
                    null
                }
            }

        fun extractMemberId(topicName: String): UUID? =
            extractPathVariable(CONTESTS_MEMBERS_REGEX, topicName, "memberId")?.let { memberIdString ->
                try {
                    UUID.fromString(memberIdString)
                } catch (e: IllegalArgumentException) {
                    null
                }
            }

        fun extractPathVariable(
            regex: Regex,
            topicName: String,
            variableName: String,
        ): String? {
            val matchResult = regex.matchEntire(topicName) ?: return null
            return matchResult.groups[variableName]?.value
        }
    }

    data class ContestsDashboardAdmin(
        val contestId: UUID,
    ) : BroadcastTopic("/contests/$contestId/dashboard/admin") {
        companion object {
            val REGEX: Regex = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/admin")
        }
    }

    data class ContestsDashboardContestant(
        val contestId: UUID,
    ) : BroadcastTopic("/contests/$contestId/dashboard/contestant") {
        companion object {
            val REGEX: Regex = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/contestant")
        }
    }

    data class ContestsDashboardGuest(
        val contestId: UUID,
    ) : BroadcastTopic("/contests/$contestId/dashboard/guest") {
        companion object {
            val REGEX: Regex = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/guest")
        }
    }

    data class ContestsDashboardJudge(
        val contestId: UUID,
    ) : BroadcastTopic("/contests/$contestId/dashboard/judge") {
        companion object {
            val REGEX: Regex = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/judge")
        }
    }

    data class ContestsDashboardStaff(
        val contestId: UUID,
    ) : BroadcastTopic("/contests/$contestId/dashboard/staff") {
        companion object {
            val REGEX: Regex = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/dashboard/staff")
        }
    }

    data class ContestsMembers(
        val contestId: UUID,
        val memberId: UUID,
    ) : BroadcastTopic("/contests/$contestId/members/$memberId") {
        companion object {
            val REGEX: Regex = Regex("/contests/(?<contestId>[a-f0-9\\-]+)/members/(?<memberId>[a-f0-9\\-]+)")
        }
    }
}
