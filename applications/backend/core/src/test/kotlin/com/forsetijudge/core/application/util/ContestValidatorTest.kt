package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec

class ContestValidatorTest :
    FunSpec({
        context("validateMemberInContest") {
            test("should not throw when member is ROOT") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)

                shouldNotThrow<ForbiddenException> { UseCaseValidator.validateMemberInContest(contest, member) }
            }

            test("should not throw when member belongs to contest") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)

                shouldNotThrow<ForbiddenException> { UseCaseValidator.validateMemberInContest(contest, member) }
            }

            test("should throw when member does not belong to contest") {
                val contest = ContestMockBuilder.build()
                val otherContest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = otherContest)

                shouldThrow<ForbiddenException> {
                    UseCaseValidator.validateMemberInContest(contest, member)
                }
            }
        }

        context("validateMemberType") {
            test("should not throw when member is ROOT") {
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)

                shouldNotThrow<ForbiddenException> {
                    UseCaseValidator.validateMemberType(member, setOf(Member.Type.ADMIN))
                }
            }

            test("should not throw when member has allowed type") {
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)

                shouldNotThrow<ForbiddenException> {
                    UseCaseValidator.validateMemberType(member, setOf(Member.Type.ADMIN, Member.Type.JUDGE))
                }
            }

            test("should throw when member does not have allowed type") {
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

                shouldThrow<ForbiddenException> {
                    UseCaseValidator.validateMemberType(member, setOf(Member.Type.ADMIN, Member.Type.JUDGE))
                }
            }
        }
    })
