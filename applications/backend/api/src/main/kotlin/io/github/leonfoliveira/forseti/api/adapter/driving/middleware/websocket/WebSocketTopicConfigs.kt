package io.github.leonfoliveira.forseti.api.adapter.driving.middleware.websocket

import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebSocketTopicConfigs(
    private val authorizeContestUseCase: AuthorizeContestUseCase,
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

                authorizeContestUseCase.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                authorizeContestUseCase.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications/children/members/[a-fA-F0-9-]+") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])
                val memberId = UUID.fromString(destination.split("/")[7])

                authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
                authorizeContestUseCase.checkIfStarted(contestId)

                val member = RequestContext.getContext().session?.member
                memberId == member?.id
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications/deleted") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                authorizeContestUseCase.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                authorizeContestUseCase.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                authorizeContestUseCase.checkIfStarted(contestId)

                true
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])

                authorizeContestUseCase.checkIfStarted(contestId)

                val member = RequestContext.getContext().session?.member
                setOf(Member.Type.ADMIN, Member.Type.JUDGE).contains(member?.type)
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full/members/[a-fA-F0-9-]+") to { destination ->
                val contestId = UUID.fromString(destination.split("/")[3])
                val memberId = UUID.fromString(destination.split("/")[7])

                authorizeContestUseCase.checkIfMemberBelongsToContest(contestId)
                authorizeContestUseCase.checkIfStarted(contestId)

                val member = RequestContext.getContext().session?.member
                memberId == member?.id
            },
        )
}
