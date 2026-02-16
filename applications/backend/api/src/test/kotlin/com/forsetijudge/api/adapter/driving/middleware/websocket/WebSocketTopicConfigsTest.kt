package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.contest.FindContestUseCase
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class WebSocketTopicConfigsTest :
    FunSpec({
        val findContestUseCase = mockk<FindContestUseCase>()
        val sut = WebSocketTopicConfigs(findContestUseCase)

        val startedContest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
        val notStartedContest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
        val member = MemberMockBuilder.build(contest = startedContest)
        val adminMember = MemberMockBuilder.build(contest = startedContest, type = Member.Type.ADMIN)
        val judgeMember = MemberMockBuilder.build(contest = startedContest, type = Member.Type.JUDGE)
        val otherMember = MemberMockBuilder.build()

        beforeEach {
            val session = SessionMockBuilder.build(member = member)
            RequestContext.getContext().session = session
        }

        context("privateFilters") {
            test("should contain all expected regex patterns") {
                val expectedPatterns =
                    listOf(
                        "/topic/contests/[a-fA-F0-9-]+/announcements",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications/children/members/[a-fA-F0-9-]+",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications/deleted",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard/freeze",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard/unfreeze",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard/partial",
                        "/topic/contests/[a-fA-F0-9-]+/submissions",
                        "/topic/contests/[a-fA-F0-9-]+/submissions/batch",
                        "/topic/contests/[a-fA-F0-9-]+/submissions/full",
                        "/topic/contests/[a-fA-F0-9-]+/submissions/full/members/[a-fA-F0-9-]+",
                        ".*",
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
                            sut.privateFilters.entries.first {
                                it.key.matches(destination)
                            }
                        matchingFilter shouldNotBe null
                        matchingFilter.key.pattern shouldBe ".*"
                    }
                }
            }

            context("announcements filter") {
                val destination = "/topic/contests/${startedContest.id}/announcements"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started and user is not privileged") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/announcements"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }

                test("should allow access when contest has not started but user is admin") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/announcements"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val session = SessionMockBuilder.build(member = adminMember)
                    RequestContext.getContext().session = session

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }
            }

            context("clarifications filter") {
                val destination = "/topic/contests/${startedContest.id}/clarifications"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/clarifications"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("clarifications children members filter") {
                val destination = "/topic/contests/${startedContest.id}/clarifications/children/members/${member.id}"

                test("should allow access when contest has started and user is the same member") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should deny access when user is different member") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val session = SessionMockBuilder.build(member = otherMember)
                    RequestContext.getContext().session = session

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when user is not authenticated") {
                    RequestContext.clearContext()
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when user belongs to different contest") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val session = SessionMockBuilder.build(member = otherMember)
                    RequestContext.getContext().session = session

                    shouldThrow<ForbiddenException> {
                        val filter =
                            sut.privateFilters.entries
                                .first { it.key.matches(destination) }
                                .value
                        filter(destination)
                    }
                }
            }

            context("clarifications deleted filter") {
                val destination = "/topic/contests/${startedContest.id}/clarifications/deleted"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/clarifications/deleted"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("leaderboard freeze filter") {
                val destination = "/topic/contests/${startedContest.id}/leaderboard/freeze"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard/freeze"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("leaderboard unfreeze filter") {
                val destination = "/topic/contests/${startedContest.id}/leaderboard/unfreeze"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard/unfreeze"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("leaderboard partial filter") {
                val destination = "/topic/contests/${startedContest.id}/leaderboard/partial"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/leaderboard/partial"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("submissions filter") {
                val destination = "/topic/contests/${startedContest.id}/submissions"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/submissions"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("submissions batch filter") {
                val destination = "/topic/contests/${startedContest.id}/submissions/batch"

                test("should allow access when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/submissions/batch"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("submissions full filter") {
                val destination = "/topic/contests/${startedContest.id}/submissions/full"

                test("should allow access for admin members when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val session = SessionMockBuilder.build(member = adminMember)
                    RequestContext.getContext().session = session

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should allow access for judge members when contest has started") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val session = SessionMockBuilder.build(member = judgeMember)
                    RequestContext.getContext().session = session

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should deny access for contestant members") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/submissions/full"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }

            context("submissions full members filter") {
                val destination = "/topic/contests/${startedContest.id}/submissions/full/members/${member.id}"

                test("should allow access when contest has started and user is the same member") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldNotThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should deny access when user is different member") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val session = SessionMockBuilder.build(member = otherMember)
                    RequestContext.getContext().session = session

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when user is not authenticated") {
                    RequestContext.clearContext()
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(destination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when user belongs to different contest") {
                    every { findContestUseCase.findById(startedContest.id) } returns startedContest

                    val session = SessionMockBuilder.build(member = otherMember)
                    RequestContext.getContext().session = session

                    shouldThrow<ForbiddenException> {
                        val filter =
                            sut.privateFilters.entries
                                .first { it.key.matches(destination) }
                                .value
                        filter(destination)
                    }
                }

                test("should throw ForbiddenException when contest has not started") {
                    val notStartedDestination = "/topic/contests/${notStartedContest.id}/submissions/full/members/${member.id}"
                    every { findContestUseCase.findById(notStartedContest.id) } returns notStartedContest

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.matches(notStartedDestination) }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(notStartedDestination)
                    }
                }
            }
        }
    })
