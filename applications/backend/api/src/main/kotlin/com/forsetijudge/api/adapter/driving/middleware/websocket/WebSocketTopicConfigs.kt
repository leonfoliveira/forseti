package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.contest.FindContestUseCase
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebSocketTopicConfigs(
    private val findContestUseCase: FindContestUseCase,
) {
    /**
     * Map of private topic destination patterns to their corresponding access filter functions.
     *
     * The key is a Regex pattern that matches the topic destination.
     * The value is a function that takes the destination string and returns a Boolean indicating
     * whether the user has access to that topic.
     */
    val privateFilters: Map<Regex, (String) -> Unit> =
        mapOf(
            Regex("/topic/contests/[a-fA-F0-9-]+/announcements") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications/children/members/[a-fA-F0-9-]+") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])
                val memberId = UUID.fromString(destination.split("/")[7])

                val contest = findContestUseCase.findById(contestId)
                checkIfMemberBelongsToContest(contest)
                checkIfStarted(contest)

                val member = RequestContext.getContext().session?.member
                if (memberId != member?.id) {
                    throw ForbiddenException("User does not have access to this clarification")
                }
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications/deleted") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard/partial") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                val contest = findContestUseCase.findById(contestId)
                checkIfStarted(contest)

                val member = RequestContext.getContext().session?.member
                if (!setOf(Member.Type.ADMIN, Member.Type.JUDGE).contains(member?.type)) {
                    throw ForbiddenException("User does not have access to full submissions")
                }
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full/members/[a-fA-F0-9-]+") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])
                val memberId = UUID.fromString(destination.split("/")[7])

                val contest = findContestUseCase.findById(contestId)
                checkIfMemberBelongsToContest(contest)
                checkIfStarted(contest)

                val member = RequestContext.getContext().session?.member
                if (memberId != member?.id) {
                    throw ForbiddenException("User does not have access to this submission")
                }
            },
            Regex(".*") to { _ ->
                throw NotFoundException("Topic not found")
            },
        )

    private fun checkIfMemberBelongsToContest(contest: Contest) {
        val member = RequestContext.getContext().session?.member
        if (member == null) {
            throw ForbiddenException("User is not authenticated")
        }
        if (member.contest != null && member.contest!!.id != contest.id) {
            throw ForbiddenException("User does not belong to the contest")
        }
    }

    private fun checkIfStarted(contest: Contest) {
        val member = RequestContext.getContext().session?.member
        if (!contest.hasStarted() && !setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE).contains(member?.type)) {
            throw ForbiddenException("Contest has not started yet")
        }
    }
}
