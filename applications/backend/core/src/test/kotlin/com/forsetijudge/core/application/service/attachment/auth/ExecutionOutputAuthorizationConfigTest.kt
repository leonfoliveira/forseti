package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import java.time.OffsetDateTime

class ExecutionOutputAuthorizationConfigTest : FunSpec({
    val sut = ExecutionOutputAuthorizationConfig()

    val currentTime = OffsetDateTime.now()
    val contest = ContestMockBuilder.build()
    val attachment = AttachmentMockBuilder.build()

    test("should return correct context") {
        sut.getContext() shouldBe Attachment.Context.EXECUTION_OUTPUT
    }

    context("upload authorization") {
        test("should allow admin upload to throw forbidden exception") {
            val adminMember = MemberMockBuilder.build()

            shouldThrow<ForbiddenException> {
                sut.authorizeAdminUpload(contest, adminMember)
            }
        }

        test("should allow judge upload to throw forbidden exception") {
            val judgeMember = MemberMockBuilder.build()

            shouldThrow<ForbiddenException> {
                sut.authorizeJudgeUpload(contest, judgeMember)
            }
        }

        test("should allow contestant upload to throw forbidden exception") {
            val contestantMember = MemberMockBuilder.build()

            shouldThrow<ForbiddenException> {
                sut.authorizeContestantUpload(contest, contestantMember)
            }
        }

        test("should allow public upload to throw forbidden exception") {
            shouldThrow<ForbiddenException> {
                sut.authorizePublicUpload(contest)
            }
        }
    }

    context("download authorization") {
        test("should allow admin download") {
            val adminMember = MemberMockBuilder.build()

            // Should not throw an exception
            sut.authorizeAdminDownload(contest, adminMember, attachment)
        }

        test("should allow judge download") {
            val judgeMember = MemberMockBuilder.build()

            // Should not throw an exception
            sut.authorizeJudgeDownload(contest, judgeMember, attachment)
        }

        test("should disallow contestant download") {
            val contestantMember = MemberMockBuilder.build()

            shouldThrow<ForbiddenException> {
                sut.authorizeContestantDownload(contest, contestantMember, attachment)
            }
        }

        test("should disallow public download") {
            shouldThrow<ForbiddenException> {
                sut.authorizePublicDownload(contest, attachment)
            }
        }
    }
})
