package io.github.leonfoliveira.judge.api.middleware.websocket

import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import org.springframework.stereotype.Component
import java.util.UUID
import kotlin.collections.contains

@Component
class WebSocketTopicConfigs(
    private val contestAuthFilter: ContestAuthFilter,
) {
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
