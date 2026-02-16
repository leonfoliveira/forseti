package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import java.time.OffsetDateTime

class AuthorizationUtilTest :
    FunSpec({
        context("checkContestStarted") {
            test("should not throw if the contest has started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, null).checkContestStarted()
                }
            }

            listOf(
                Member.Type.CONTESTANT,
            ).forEach { memberType ->
                test("should throw if the contest has not started and the member is $memberType") {
                    val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                    val member = MemberMockBuilder.build(type = memberType)

                    shouldThrow<ForbiddenException> {
                        ContestAuthorizer(contest, member).checkContestStarted()
                    }
                }
            }

            listOf(
                Member.Type.ROOT,
                Member.Type.ADMIN,
                Member.Type.JUDGE,
            ).forEach { memberType ->
                test("should not throw if the contest has not started and the member is $memberType") {
                    val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                    val member = MemberMockBuilder.build(type = memberType)

                    shouldNotThrow<ForbiddenException> {
                        ContestAuthorizer(contest, member).checkContestStarted()
                    }
                }
            }

            test("should not throw if the contest has not started and the member is a system member") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(contest = null)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).checkContestStarted()
                }
            }

            test("should throw if the contest has not started and the member is null") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, null).checkContestStarted()
                }
            }
        }

        context("checkMemberType") {
            test("should not throw if the member type is allowed") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldNotThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).checkMemberType(Member.Type.CONTESTANT)
                }
            }

            test("should throw if the member type is not allowed") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, member).checkMemberType(Member.Type.ADMIN)
                }
            }

            test("should throw if the member is null") {
                val contest = ContestMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    ContestAuthorizer(contest, null).checkMemberType(Member.Type.ADMIN)
                }
            }
        }
    })
