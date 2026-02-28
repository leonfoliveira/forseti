package com.forsetijudge.api.adapter.driving.socketio.listener

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.JudgePrivateBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SocketIORoomAuthorizers(
    private val contestAuthorizerUseCase: ContestAuthorizerUseCase,
) {
    /**
     * Map of private roomName patterns to their corresponding access filter functions.
     *
     * The key is a Regex pattern that matches the topic roomName.
     * The value is a function that takes the roomName string and throws a ForbiddenException if the user does not have access to the topic.
     */
    val authorizers: Map<Regex, (String) -> Unit> =
        mapOf(
            AdminDashboardBroadcastRoom.pattern to { roomName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
                            .throwIfErrors()
                    },
                )
            },
            ContestantDashboardBroadcastRoom.pattern to { roomName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT)
                            .requireContestStarted()
                            .throwIfErrors()
                    },
                )
            },
            GuestDashboardBroadcastRoom.pattern to { roomName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireSettingGuestEnabled()
                            .requireContestStarted()
                            .throwIfErrors()
                    },
                )
            },
            JudgeDashboardBroadcastRoom.pattern to { roomName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.JUDGE)
                            .throwIfErrors()
                    },
                )
            },
            StaffDashboardBroadcastRoom.pattern to { roomName ->
                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.STAFF)
                            .throwIfErrors()
                    },
                )
            },
            ContestantPrivateBroadcastRoom.pattern to { roomName ->
                val contextMemberId = ExecutionContext.getMemberId()
                val memberId = extractMemberId(ContestantPrivateBroadcastRoom.pattern, roomName)

                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT)
                            .requireContestStarted()
                            .throwIfErrors()
                    },
                )

                if (memberId != contextMemberId) {
                    throw ForbiddenException("Cannot subscribe to another member's private topic")
                }
            },
            JudgePrivateBroadcastRoom.pattern to { roomName ->
                val contextMemberId = ExecutionContext.getMemberId()
                val memberId = extractMemberId(JudgePrivateBroadcastRoom.pattern, roomName)

                contestAuthorizerUseCase.execute(
                    ContestAuthorizerUseCase.Command { contestAuthorizer ->
                        contestAuthorizer
                            .requireMemberType(Member.Type.JUDGE)
                            .throwIfErrors()
                    },
                )

                if (memberId != contextMemberId) {
                    throw ForbiddenException("Cannot subscribe to another member's private topic")
                }
            },
        )

    /**
     * Extracts the member ID from the room name using the provided regex pattern.
     *
     * @param pattern The regex pattern to match the room name.
     * @param roomName The room name from which to extract the member ID.
     * @return The extracted member ID as a UUID.
     */
    private fun extractMemberId(
        pattern: Regex,
        roomName: String,
    ): UUID {
        val matchResult = pattern.matchEntire(roomName)
        val memberIdString =
            matchResult?.groups?.get("memberId")?.value
                ?: throw IllegalArgumentException("Invalid room name: $roomName")
        return try {
            UUID.fromString(memberIdString)
        } catch (_: IllegalArgumentException) {
            throw ForbiddenException("Invalid member ID in room name: $roomName")
        }
    }
}
