package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebSocketTopicConfigs(
    private val contestAuthorizerUseCase: ContestAuthorizerUseCase,
) {
    /**
     * Map of private topic destination patterns to their corresponding access filter functions.
     *
     * The key is a Regex pattern that matches the topic destination.
     * The value is a function that takes the destination string and throws a ForbiddenException if the user does not have access to the topic.
     */
    val privateFilters: Map<Regex, (String) -> Unit> =
        mapOf(
            Regex("/topic/contests/[a-fA-F0-9-]+/announcements") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/clarifications:answer") to { destination ->
                val memberId = UUID.fromString(destination.split("/")[5])
                val contextMemberId = ExecutionContext.getMember().id
                if (memberId != contextMemberId) {
                    throw ForbiddenException("Member does not have access to other members' topic")
                }

                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/clarifications:deleted") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard:cell") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard:frozen") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/leaderboard:unfrozen") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/submissions:with-code-and-executions") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/submissions:with-code") to { destination ->
                val memberId = UUID.fromString(destination.split("/")[5])
                val contextMemberId = ExecutionContext.getMember().id
                if (memberId != contextMemberId) {
                    throw ForbiddenException("Member does not have access to other members' topic")
                }

                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/tickets") to { destination ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
            Regex("/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/tickets") to { destination ->
                val memberId = UUID.fromString(destination.split("/")[5])
                val contextMemberId = ExecutionContext.getMember().id
                if (memberId != contextMemberId) {
                    throw ForbiddenException("Member does not have access to other members' topic")
                }

                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireContestStarted() }, { it.requireMemberCanAccessNotStartedContest() })
                            .throwIfErrors()
                    },
                )
            },
        )
}
