package com.forsetijudge.api.adapter.driving.socketio.listener

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import org.springframework.stereotype.Component

@Component
class SocketIOTopicPrivateConfigs(
    private val contestAuthorizerUseCase: ContestAuthorizerUseCase,
) {
    /**
     * Map of private topicName patterns to their corresponding access filter functions.
     *
     * The key is a Regex pattern that matches the topic topicName.
     * The value is a function that takes the topicName string and throws a ForbiddenException if the user does not have access to the topic.
     */
    val privateFilters: Map<Regex, (String) -> Unit> =
        mapOf(
            BroadcastTopic.ContestsDashboardAdmin.REGEX to { topicName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
                            .throwIfErrors()
                    },
                )
            },
            BroadcastTopic.ContestsDashboardContestant.REGEX to { topicName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.CONTESTANT)
                            .requireContestStarted()
                            .throwIfErrors()
                    },
                )
            },
            BroadcastTopic.ContestsDashboardGuest.REGEX to { topicName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireContestStarted()
                            .throwIfErrors()
                    },
                )
            },
            BroadcastTopic.ContestsDashboardJudge.REGEX to { topicName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.JUDGE)
                            .throwIfErrors()
                    },
                )
            },
            BroadcastTopic.ContestsDashboardStaff.REGEX to { topicName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.STAFF)
                            .throwIfErrors()
                    },
                )
            },
            BroadcastTopic.ContestsMembers.REGEX to { topicName ->
                val contextMemberId = ExecutionContext.getMemberId()
                val memberId = BroadcastTopic.extractMemberId(topicName)

                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
                            .throwIfErrors()
                    },
                )

                if (memberId != contextMemberId) {
                    throw ForbiddenException("Cannot subscribe to another member's private topic")
                }
            },
        )
}
