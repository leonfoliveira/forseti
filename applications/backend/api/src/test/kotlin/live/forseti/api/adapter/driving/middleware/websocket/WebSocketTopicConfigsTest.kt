package live.forseti.api.adapter.driving.middleware.websocket

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.ContestMockBuilder
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.entity.SessionMockBuilder
import live.forseti.core.domain.exception.ForbiddenException
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import java.util.UUID

class WebSocketTopicConfigsTest :
    FunSpec({
        val authorizeContestUseCase = mockk<AuthorizeContestUseCase>(relaxed = true)
        val sut = WebSocketTopicConfigs(authorizeContestUseCase)

        beforeEach {
            RequestContext.clearContext()
        }

        context("privateFilters") {
            test("should contain all expected regex patterns") {
                val expectedPatterns =
                    listOf(
                        "/topic/contests/[a-fA-F0-9-]+/announcements",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications/children/members/[a-fA-F0-9-]+",
                        "/topic/contests/[a-fA-F0-9-]+/clarifications/deleted",
                        "/topic/contests/[a-fA-F0-9-]+/leaderboard",
                        "/topic/contests/[a-fA-F0-9-]+/submissions",
                        "/topic/contests/[a-fA-F0-9-]+/submissions/full",
                        "/topic/contests/[a-fA-F0-9-]+/submissions/full/members/[a-fA-F0-9-]+",
                    )

                sut.privateFilters.keys.size shouldBe expectedPatterns.size
                expectedPatterns.forEach { pattern ->
                    sut.privateFilters.keys.any { it.pattern == pattern } shouldBe true
                }
            }

            context("announcements filter") {
                val contestId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/announcements"

                test("should return true when contest access is allowed") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.pattern.contains("announcements") }
                            .value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }

                test("should throw exception when contest access is forbidden") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } throws ForbiddenException("Access denied")

                    val filter =
                        sut.privateFilters.entries
                            .first { it.key.pattern.contains("announcements") }
                            .value

                    shouldThrow<ForbiddenException> {
                        filter(destination)
                    }
                }
            }

            context("clarifications filter") {
                val contestId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/clarifications"

                test("should return true when contest access is allowed") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("clarifications") &&
                                    !it.key.pattern.contains("children") &&
                                    !it.key.pattern.contains("deleted")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }
            }

            context("clarifications children members filter") {
                val contestId = UUID.randomUUID()
                val memberId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/clarifications/children/members/$memberId"

                test("should return true when member owns the clarification") {
                    every { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) } returns Unit
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(id = memberId, contest = ContestMockBuilder.build(id = contestId)),
                        )

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("clarifications/children/members")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }

                test("should return false when member does not own the clarification") {
                    every { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) } returns Unit
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session = SessionMockBuilder.build()

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("clarifications/children/members")
                            }.value
                    val result = filter(destination)

                    result shouldBe false
                }

                test("should return false when member is null") {
                    every { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) } returns Unit
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session = null

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("clarifications/children/members")
                            }.value
                    val result = filter(destination)

                    result shouldBe false
                }
            }

            context("clarifications deleted filter") {
                val contestId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/clarifications/deleted"

                test("should return true when contest access is allowed") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("clarifications/deleted")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }
            }

            context("leaderboard filter") {
                val contestId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/leaderboard"

                test("should return true when contest access is allowed") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("leaderboard")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }
            }

            context("submissions filter") {
                val contestId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/submissions"

                test("should return true when contest access is allowed") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions") && !it.key.pattern.contains("full")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }
            }

            context("submissions full filter") {
                val contestId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/submissions/full"

                test("should return true when member is ADMIN") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member =
                                MemberMockBuilder.build(
                                    type = Member.Type.ADMIN,
                                    contest = ContestMockBuilder.build(id = contestId),
                                ),
                        )

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full") && !it.key.pattern.contains("members")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                }

                test("should return true when member is JUDGE") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member =
                                MemberMockBuilder.build(
                                    type = Member.Type.JUDGE,
                                    contest = ContestMockBuilder.build(id = contestId),
                                ),
                        )

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full") && !it.key.pattern.contains("members")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                }

                test("should return false when member is CONTESTANT") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member =
                                MemberMockBuilder.build(
                                    type = Member.Type.CONTESTANT,
                                    contest = ContestMockBuilder.build(id = contestId),
                                ),
                        )

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full") && !it.key.pattern.contains("members")
                            }.value
                    val result = filter(destination)

                    result shouldBe false
                }

                test("should return false when member is null") {
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session = null

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full") && !it.key.pattern.contains("members")
                            }.value
                    val result = filter(destination)

                    result shouldBe false
                }
            }

            context("submissions full members filter") {
                val contestId = UUID.randomUUID()
                val memberId = UUID.randomUUID()
                val destination = "/topic/contests/$contestId/submissions/full/members/$memberId"

                test("should return true when member owns the submissions") {
                    every { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) } returns Unit
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member =
                                MemberMockBuilder.build(
                                    id = memberId,
                                    contest = ContestMockBuilder.build(id = contestId),
                                ),
                        )

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full/members")
                            }.value
                    val result = filter(destination)

                    result shouldBe true
                    verify { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) }
                    verify { authorizeContestUseCase.checkIfStarted(contestId) }
                }

                test("should return false when member does not own the submissions") {
                    every { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) } returns Unit
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session = SessionMockBuilder.build()

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full/members")
                            }.value
                    val result = filter(destination)

                    result shouldBe false
                }

                test("should return false when member is null") {
                    every { authorizeContestUseCase.checkIfMemberBelongsToContest(contestId) } returns Unit
                    every { authorizeContestUseCase.checkIfStarted(contestId) } returns Unit
                    RequestContext.getContext().session = null

                    val filter =
                        sut.privateFilters.entries
                            .first {
                                it.key.pattern.contains("submissions/full/members")
                            }.value
                    val result = filter(destination)

                    result shouldBe false
                }
            }

            context("regex pattern matching") {
                test("should match valid contest UUIDs in destinations") {
                    val contestId = "123e4567-e89b-12d3-a456-426614174000"
                    val patterns =
                        listOf(
                            "/topic/contests/$contestId/announcements",
                            "/topic/contests/$contestId/clarifications",
                            "/topic/contests/$contestId/leaderboard",
                            "/topic/contests/$contestId/submissions",
                        )

                    patterns.forEach { destination ->
                        val matchingFilter =
                            sut.privateFilters.entries.find {
                                it.key.matches(destination)
                            }
                        matchingFilter shouldNotBe null
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
                        val matchingFilters =
                            sut.privateFilters.entries.filter {
                                it.key.matches(destination)
                            }
                        matchingFilters.size shouldBe 0
                    }
                }
            }
        }
    })
