package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.InternalServerException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import java.time.OffsetDateTime

class ContestAuthorizerTest :
    FunSpec({
        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        context("or") {
            test("should return if any of the authorizers pass") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member)
                        .or(
                            { it.requireMemberCanAccessNotStartedContest() },
                            { it.requireContestStarted() },
                        ).throwIfErrors()
                }
            }

            test("should throw if all authorizers fail") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member)
                        .or(
                            { it.requireContestStarted() },
                            { it.requireMemberType(Member.Type.ADMIN) },
                        ).throwIfErrors()
                }
            }
        }

        context("requireContestNotStarted") {
            test("should throw if the contest is null") {
                shouldThrow<InternalServerException> {
                    ContestAuthorizer(null, null).requireContestStarted().throwIfErrors()
                }
            }

            test("should not throw if the contest has not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestStarted().throwIfErrors()
                }
            }

            test("should not throw if the contest has started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build()

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestStarted().throwIfErrors()
                }
            }
        }

        context("requireContestStarted") {
            test("should throw if the contest is null") {
                shouldThrow<InternalServerException> {
                    ContestAuthorizer(null, null).requireContestNotStarted().throwIfErrors()
                }
            }

            test("should throw if the contest has started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestNotStarted().throwIfErrors()
                }
            }

            test("should not throw if the contest has not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestNotStarted().throwIfErrors()
                }
            }
        }

        context("requireContestNotEnded") {
            test("should throw if the contest is null") {
                shouldThrow<InternalServerException> {
                    ContestAuthorizer(null, null).requireContestNotEnded().throwIfErrors()
                }
            }

            test("should throw if the contest has ended") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(2),
                        endAt = OffsetDateTime.now().minusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestNotEnded().throwIfErrors()
                }
            }

            test("should not throw if the contest has not ended") {
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestNotEnded().throwIfErrors()
                }
            }
        }

        context("requireContestActive") {
            test("should throw if the contest is null") {
                shouldThrow<InternalServerException> {
                    ContestAuthorizer(null, null).requireContestActive().throwIfErrors()
                }
            }

            test("should throw if the contest has not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestActive().throwIfErrors()
                }
            }

            test("should throw if the contest has ended") {
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestActive().throwIfErrors()
                }
            }

            test("should not throw if the contest is active") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireContestActive().throwIfErrors()
                }
            }
        }

        context("checkMemberType") {
            test("should not throw if the member type is allowed") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(
                        contest,
                        member,
                    ).requireMemberType(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT).throwIfErrors()
                }
            }

            test("should throw if the member type is not allowed") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireMemberType(Member.Type.ADMIN).throwIfErrors()
                }
            }

            test("should throw if the member is null") {
                val contest = ContestMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, null).requireMemberType(Member.Type.ADMIN).throwIfErrors()
                }
            }
        }

        context("requireMemberCanAccessNotStartedContest") {
            test("should throw if the member is null") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))

                shouldThrow<InternalServerException> {
                    ContestAuthorizer(contest, null).requireMemberCanAccessNotStartedContest().throwIfErrors()
                }
            }

            test("should throw if the member type is not allowed to access not started contest") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireMemberCanAccessNotStartedContest().throwIfErrors()
                }
            }

            test("should not throw if the member type is allowed to access not started contest") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).requireMemberCanAccessNotStartedContest().throwIfErrors()
                }
            }
        }
    })
