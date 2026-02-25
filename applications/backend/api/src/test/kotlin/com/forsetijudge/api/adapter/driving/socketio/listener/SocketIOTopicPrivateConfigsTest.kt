package com.forsetijudge.api.adapter.driving.socketio.listener

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.time.OffsetDateTime

class SocketIOTopicPrivateConfigsTest :
    FunSpec({
        val contestAuthorizerUseCase = mockk<ContestAuthorizerUseCase>(relaxed = true)

        val sut =
            SocketIOTopicPrivateConfigs(
                contestAuthorizerUseCase = contestAuthorizerUseCase,
            )

        beforeEach {
            clearAllMocks()
        }

        context("privateFilters") {
            test("should contain all expected regex patterns") {
                val expectedRegex =
                    listOf(
                        BroadcastTopic.ContestsDashboardAdmin.REGEX,
                        BroadcastTopic.ContestsDashboardContestant.REGEX,
                        BroadcastTopic.ContestsDashboardGuest.REGEX,
                        BroadcastTopic.ContestsDashboardJudge.REGEX,
                        BroadcastTopic.ContestsDashboardStaff.REGEX,
                        BroadcastTopic.ContestsMembers.REGEX,
                    )

                sut.privateFilters.keys.size shouldBe expectedRegex.size
                expectedRegex.forEach { regex ->
                    sut.privateFilters.keys.any { it == regex } shouldBe true
                }
            }
        }

        context("ContestsDashboardAdmin") {
            Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN) }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.privateFilters[BroadcastTopic.ContestsDashboardAdmin.REGEX] ?: error("Filter not found")
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

                    val filter = sut.privateFilters[BroadcastTopic.ContestsDashboardContestant.REGEX] ?: error("Filter not found")
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

                val filter = sut.privateFilters[BroadcastTopic.ContestsDashboardContestant.REGEX] ?: error("Filter not found")
                filter("/contests/${contest.id}/dashboard/contestant")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest, member)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }
        }

        context("ContestsDashboardGuest") {
            test("should throw ForbiddenException if contest not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))

                val filter = sut.privateFilters[BroadcastTopic.ContestsDashboardGuest.REGEX] ?: error("Filter not found")
                filter("/contests/${contest.id}/dashboard/guest")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }
        }

        context("ContestsDashboardJudge") {
            Member.Type.entries.filter { it != Member.Type.JUDGE }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.privateFilters[BroadcastTopic.ContestsDashboardJudge.REGEX] ?: error("Filter not found")
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

        context("ContestsDashboardStaff") {
            Member.Type.entries.filter { it != Member.Type.STAFF }.forEach { memberType ->
                test("should throw ForbiddenException for member type $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType)

                    val filter = sut.privateFilters[BroadcastTopic.ContestsDashboardStaff.REGEX] ?: error("Filter not found")
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

        context("ContestsMembers") {
            test("should throw ForbiddenException when subscribing to another member's private topic") {
                val member1 = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val member2 = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build()
                ExecutionContextMockBuilder.build(contest.id, member1.id)

                val filter = sut.privateFilters[BroadcastTopic.ContestsMembers.REGEX] ?: error("Filter not found")
                shouldThrow<ForbiddenException> {
                    filter("/contests/${contest.id}/members/${member2.id}")
                }
            }

            test("should throw ForbiddenException when contest has not started and member cannot access not started contest") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                ExecutionContextMockBuilder.build(contest.id, member.id)

                val filter = sut.privateFilters[BroadcastTopic.ContestsMembers.REGEX] ?: error("Filter not found")
                filter("/contests/${contest.id}/members/${member.id}")

                val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                val authorizer = ContestAuthorizer(contest, member)
                shouldThrow<ForbiddenException> {
                    commandSlot.captured.chain(authorizer)
                }
            }

            test("should not throw when subscribing to own private topic") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build()
                ExecutionContextMockBuilder.build(null, member.id)

                val filter = sut.privateFilters[BroadcastTopic.ContestsMembers.REGEX] ?: error("Filter not found")
                shouldNotThrow<ForbiddenException> {
                    filter("/contests/${contest.id}/members/${member.id}")
                }
            }
        }
    })
