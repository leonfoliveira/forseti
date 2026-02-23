package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.authentication.ContestAuthorizerUseCase
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.time.OffsetDateTime

class WebSocketTopicConfigsTest :
    FunSpec({
        val contestAuthorizerUseCase = mockk<ContestAuthorizerUseCase>(relaxed = true)

        val sut =
            WebSocketTopicConfigs(
                contestAuthorizerUseCase = contestAuthorizerUseCase,
            )

        val startedContest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
        val notStartedContest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))

        val adminMember = MemberMockBuilder.build(type = Member.Type.ADMIN)
        val contestantMember = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

        beforeEach {
            clearAllMocks()
        }

        context("privateFilters") {
            test("should contain all expected regex patterns") {
                val expectedPatterns =
                    listOf(
                        "/topic/contests/[a-fA-F0-9-]+/announcements",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications",
                        "/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/clarifications:answer",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications:delete",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard:freeze",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard:unfreeze",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard:cell",
                        "/topic/contests/[a-fA-F0-9-]+/submissions",
                        "/topic/contests/[a-fA-F0-9-]+/submissions:with-code-and-execution",
                        "/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/submissions:with-code",
                        "/topic/contests/[a-fA-F0-9-]+/tickets",
                        "/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/tickets",
                    )

                sut.privateFilters.keys.size shouldBe expectedPatterns.size
                expectedPatterns.forEach { pattern ->
                    sut.privateFilters.keys.any { it.pattern == pattern } shouldBe true
                }
            }

            context("regex pattern matching") {
                test("should match valid contest UUIDs in destinations") {
                    val contestId = "123e4567-e89b-12d3-a456-426614174000"
                    val patterns =
                        listOf(
                            "/topic/contests/$contestId/announcements",
                            "/topic/contests/$contestId/clarifications",
                            "/topic/contests/$contestId/submissions",
                        )

                    patterns.forEach { destination ->
                        val matchingFilter =
                            sut.privateFilters.entries.first {
                                it.key.matches(destination)
                            }
                        matchingFilter shouldNotBe null
                        matchingFilter.key.pattern shouldNotBe ".*"
                    }
                }

                test("should not match invalid destinations") {
                    val invalidDestinations =
                        listOf(
                            "/topic/contests/invalid-uuid/announcements",
                            "/topic/other/announcements",
                            "/different/path",
                            "",
                        )

                    invalidDestinations.forEach { destination ->
                        val matchingFilter =
                            sut.privateFilters.entries.find {
                                it.key.matches(destination)
                            }
                        matchingFilter shouldBe null
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/announcements") {
                val destination = "/topic/contests/${startedContest.id}/announcements"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    filter(destination)

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination =
                        "/topic/contests/${notStartedContest.id}/announcements"

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    // use the not-started destination when invoking the filter
                    filter(notStartedDestination)

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination =
                        "/topic/contests/${notStartedContest.id}/announcements"

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    // use the not-started destination when invoking the filter
                    filter(notStartedDestination)

                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/clarifications") {
                val destination = "/topic/contests/${startedContest.id}/clarifications"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/clarifications"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/clarifications"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/clarifications:answer") {
                val destination =
                    "/topic/contests/${startedContest.id}/members/${contestantMember.id}" +
                        "/clarifications:answer"

                test("should allow access when contest has started") {
                    ExecutionContextMockBuilder.build(startedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when member tries to access other member's topic") {
                    val otherMember = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                    ExecutionContextMockBuilder.build(startedContest.id, otherMember.id)
                    val destination =
                        "/topic/contests/${startedContest.id}/members/${contestantMember.id}" +
                            "/clarifications:answer"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination =
                        "/topic/contests/${notStartedContest.id}/members/${contestantMember.id}" +
                            "/clarifications:answer"
                    ExecutionContextMockBuilder.build(notStartedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination =
                        "/topic/contests/${notStartedContest.id}/members/${contestantMember.id}" +
                            "/clarifications:answer"
                    ExecutionContextMockBuilder.build(notStartedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/clarifications:delete") {
                val destination = "/topic/contests/${startedContest.id}/clarifications:delete"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/clarifications:delete"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/clarifications:delete"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/leaderboard:freeze") {
                val destination = "/topic/contests/${startedContest.id}/leaderboard:freeze"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard:freeze"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard:freeze"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/leaderboard:unfreeze") {
                val destination = "/topic/contests/${startedContest.id}/leaderboard:unfreeze"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard:unfreeze"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard:unfreeze"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/leaderboard:cell") {
                val destination = "/topic/contests/${startedContest.id}/leaderboard:cell"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard:cell"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard:cell"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/submissions") {
                val destination = "/topic/contests/${startedContest.id}/submissions"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/submissions"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/submissions"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/submissions:with-code-and-execution") {
                val destination = "/topic/contests/${startedContest.id}/submissions:with-code-and-execution"

                test("should throw ForbiddenException when member type is not authorized") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should allow access when member type is authorized") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/submissions:with-code") {
                val destination =
                    "/topic/contests/${startedContest.id}/members/${contestantMember.id}" +
                        "/submissions:with-code"

                test("should allow access when contest has started") {
                    ExecutionContextMockBuilder.build(startedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when member tries to access another member's submissions") {
                    val otherMember = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                    ExecutionContextMockBuilder.build(startedContest.id, otherMember.id)
                    val destination =
                        "/topic/contests/${startedContest.id}/members/${contestantMember.id}" +
                            "/submissions:with-code"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination =
                        "/topic/contests/${notStartedContest.id}/members/${contestantMember.id}" +
                            "/submissions:with-code"
                    ExecutionContextMockBuilder.build(notStartedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination =
                        "/topic/contests/${notStartedContest.id}/members/${contestantMember.id}" +
                            "/submissions:with-code"
                    ExecutionContextMockBuilder.build(notStartedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/tickets") {
                val destination = "/topic/contests/${startedContest.id}/tickets"

                test("should allow access when contest has started") {
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/tickets"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/tickets"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }

            context("/topic/contests/[a-fA-F0-9-]+/members/[a-fA-F0-9-]+/tickets") {
                val destination = "/topic/contests/${startedContest.id}/members/${contestantMember.id}/tickets"

                test("should allow access when contest has started") {
                    ExecutionContextMockBuilder.build(startedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    filter(destination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(startedContest, contestantMember))
                    }
                }

                test("should throw ForbiddenException when member tries to access other member's tickets") {
                    val otherMember = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                    ExecutionContextMockBuilder.build(startedContest.id, otherMember.id)
                    val destination = "/topic/contests/${startedContest.id}/members/${contestantMember.id}/tickets"
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value
                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/members/${contestantMember.id}/tickets"
                    ExecutionContextMockBuilder.build(notStartedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, contestantMember))
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/members/${contestantMember.id}/tickets"
                    ExecutionContextMockBuilder.build(notStartedContest.id, contestantMember.id)
                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value
                    filter(notStartedDestination)
                    val commandSlot = slot<ContestAuthorizerUseCase.Command>()
                    verify { contestAuthorizerUseCase.execute(capture(commandSlot)) }
                    shouldNotThrow<ForbiddenException> {
                        commandSlot.captured.chain(ContestAuthorizer(notStartedContest, adminMember))
                    }
                }
            }
        }
    })
