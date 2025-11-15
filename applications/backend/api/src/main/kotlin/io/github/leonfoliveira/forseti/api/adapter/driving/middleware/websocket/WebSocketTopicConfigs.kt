package io.github.leonfoliveira.forseti.api.adapter.driving.middleware.websocket

import io.github.leonfoliveira.forseti.api.adapter.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebSocketTopicConfigs(
    private val contestAuthFilter: ContestAuthFilter,
) {
    /**
     * Map of private topic destination patterns to their corresponding access filter functions.
     *
     * The key is a Regex pattern that matches the topic destination.
     * The value is a function that takes the destination string and returns a Boolean indicating
     * whether the user has access to that topic.
     */
    val privateFilters: Map<Regex, (String) -> Boolean> =
        mapOf(
            Regex("/topic/contests/[a-fA-F0-9-]+/announcements") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                contestAuthFilter.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                contestAuthFilter.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications/children/members/[a-fA-F0-9-]+") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])
                val memberId = UUID.fromString(destination.split("/")[7])

                contestAuthFilter.checkIfMemberBelongsToContest(contestId)
                contestAuthFilter.checkIfStarted(contestId)

                val member = RequestContext.getContext().session?.member
                memberId == member?.id
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications/deleted") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                contestAuthFilter.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                contestAuthFilter.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                contestAuthFilter.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                contestAuthFilter.checkIfStarted(contestId)

                val member = RequestContext.getContext().session?.member
                setOf(Member.Type.ADMIN, Member.Type.JUDGE).contains(member?.type)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full/members/[a-fA-F0-9-]+") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])
                val memberId = UUID.fromString(destination.split("/")[7])

                contestAuthFilter.checkIfMemberBelongsToContest(contestId)
                contestAuthFilter.checkIfStarted(contestId)

                val member = RequestContext.getContext().session?.member
                memberId == member?.id
            },
        )
}
