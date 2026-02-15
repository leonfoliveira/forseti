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
                    AuthorizationUtil.checkContestStarted(contest, null)
                }
            }

            listOf(
                Member.Type.CONTESTANT,
            ).forEach { memberType ->
                test("should throw if the contest has not started and the member is $memberType") {
                    val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                    val member = MemberMockBuilder.build(type = memberType)

                    shouldThrow<ForbiddenException> {
                        AuthorizationUtil.checkContestStarted(contest, member)
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
                        AuthorizationUtil.checkContestStarted(contest, member)
                    }
                }
            }

            test("should not throw if the contest has not started and the member is a system member") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(contest = null)

                shouldNotThrow<ForbiddenException> {
                    AuthorizationUtil.checkContestStarted(contest, member)
                }
            }

            test("should throw if the contest has not started and the member is null") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))

                shouldThrow<ForbiddenException> {
                    AuthorizationUtil.checkContestStarted(contest, null)
                }
            }
        }

        context("checkMemberType") {
            test("should not throw if the member type is allowed") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldNotThrow<ForbiddenException> {
                    AuthorizationUtil.checkMemberType(member, Member.Type.CONTESTANT)
                }
            }

            test("should throw if the member type is not allowed") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    AuthorizationUtil.checkMemberType(member, Member.Type.ADMIN)
                }
            }

            test("should throw if the member is null") {
                shouldThrow<ForbiddenException> {
                    AuthorizationUtil.checkMemberType(null, Member.Type.ADMIN)
                }
            }
        }
    })
