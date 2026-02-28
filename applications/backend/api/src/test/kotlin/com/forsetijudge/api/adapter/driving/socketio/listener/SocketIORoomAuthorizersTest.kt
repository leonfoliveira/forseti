package com.forsetijudge.api.adapter.driving.socketio.listener

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.JudgePrivateBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.time.OffsetDateTime

class SocketIORoomAuthorizersTest :
    FunSpec({
        val contestAuthorizerUseCase = mockk<ContestAuthorizerUseCase>(relaxed = true)

        val sut =
            SocketIORoomAuthorizers(
                contestAuthorizerUseCase = contestAuthorizerUseCase,
            )

        beforeEach {
            clearAllMocks()
        }

        context("privateFilters") {
            test("should contain all expected regex patterns") {
                val expectedRegex =
                    listOf(
                        AdminDashboardBroadcastRoom.pattern,
                        ContestantDashboardBroadcastRoom.pattern,
                        GuestDashboardBroadcastRoom.pattern,
                        JudgeDashboardBroadcastRoom.pattern,
                        StaffDashboardBroadcastRoom.pattern,
                        ContestantPrivateBroadcastRoom.pattern,
                        JudgePrivateBroadcastRoom.pattern,
                    )

                sut.authorizers.keys.size shouldBe expectedRegex.size
                expectedRegex.forEach { regex ->
                    sut.authorizers.keys.any { it == regex } shouldBe true
                }
            }
        }

        context("ContestsDashboardAdmin") {
            Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN) }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.authorizers[AdminDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                    filter("/contests/${contest.id}/dashboard/admin")

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    val authorizer = ContestAuthorizer(contest, member)
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(authorizer)
                    }
                }
            }
        }

        context("ContestsDashboardContestant") {
            Member.Type.entries.filter { it != Member.Type.CONTESTANT }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.authorizers[ContestantDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                    filter("/contests/${contest.id}/dashboard/contestant")

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    val authorizer = ContestAuthorizer(contest, member)
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(authorizer)
                    }
                }
            }

            test("should throw ForbiddenException if contest not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                val filter = sut.authorizers[ContestantDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                filter("/contests/${contest.id}/dashboard/contestant")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest, member)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }
        }

        context("GuestDashboardBroadcastRoom") {
            test("should throw ForbiddenException if guest setting is disabled") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        settings = Contest.Settings(isGuestEnabled = false),
                    )

                val filter = sut.authorizers[GuestDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                filter("/contests/${contest.id}/dashboard/guest")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }

            test("should throw ForbiddenException if contest not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))

                val filter = sut.authorizers[GuestDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                filter("/contests/${contest.id}/dashboard/guest")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }
        }

        context("JudgeDashboardBroadcastRoom") {
            Member.Type.entries.filter { it != Member.Type.JUDGE }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.authorizers[JudgeDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                    filter("/contests/${contest.id}/dashboard/judge")

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    val authorizer = ContestAuthorizer(contest, member)
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(authorizer)
                    }
                }
            }
        }

        context("StaffDashboardBroadcastRoom") {
            Member.Type.entries.filter { it != Member.Type.STAFF }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.authorizers[StaffDashboardBroadcastRoom.pattern] ?: error("Filter not found")
                    filter("/contests/${contest.id}/dashboard/staff")

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    val authorizer = ContestAuthorizer(contest, member)
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(authorizer)
                    }
                }
            }
        }

        context("ContestantPrivateBroadcastRoom") {
            Member.Type.entries.filter { it != Member.Type.CONTESTANT }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val member = MemberMockBuilder.build(type = memberType)
                    val contest = ContestMockBuilder.build()
                    ExecutionContextMockBuilder.build(contest.id, member.id)

                    val filter = sut.authorizers[ContestantPrivateBroadcastRoom.pattern] ?: error("Filter not found")
                    filter("/contests/${contest.id}/members/${member.id}/private/contestant")

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    val authorizer = ContestAuthorizer(contest, member)
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(authorizer)
                    }
                }
            }

            test("should throw ForbiddenException when contest has not started") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                ExecutionContextMockBuilder.build(contest.id, member.id)

                val filter = sut.authorizers[ContestantPrivateBroadcastRoom.pattern] ?: error("Filter not found")
                filter("/contests/${contest.id}/members/${member.id}/private/contestant")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest, member)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }

            test("should throw ForbiddenException when subscribing to another member's private topic") {
                val member1 = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val member2 = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build()
                ExecutionContextMockBuilder.build(contest.id, member1.id)

                val filter = sut.authorizers[ContestantPrivateBroadcastRoom.pattern] ?: error("Filter not found")
                shouldThrow<ForbiddenException> {
                    filter("/contests/${contest.id}/members/${member2.id}/private/contestant")
                }
            }
        }

        context("JudgePrivateBroadcastRoom") {
            test("should throw ForbiddenException for member type other than JUDGE") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build()
                ExecutionContextMockBuilder.build(contest.id, member.id)

                val filter = sut.authorizers[JudgePrivateBroadcastRoom.pattern] ?: error("Filter not found")
                filter("/contests/${contest.id}/members/${member.id}/private/judge")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest, member)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }

            test("should throw ForbiddenException when subscribing to another member's private topic") {
                val member1 = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val member2 = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build()
                ExecutionContextMockBuilder.build(contest.id, member1.id)

                val filter = sut.authorizers[JudgePrivateBroadcastRoom.pattern] ?: error("Filter not found")
                shouldThrow<ForbiddenException> {
                    filter("/contests/${contest.id}/members/${member2.id}/private/judge")
                }
            }
        }
    })
