package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import java.time.OffsetDateTime

class SubmissionCodeAuthorizationConfigTest :
    FunSpec({
        val sut = SubmissionCodeAuthorizationConfig()

        beforeEach {
            clearAllMocks()
        }

        context("getContext") {
            test("should return SUBMISSION_CODE context") {
                sut.getContext() shouldBe Attachment.Context.SUBMISSION_CODE
            }
        }

        context("authorizeAdminUpload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeAdminUpload(contest, member)
                }
            }
        }

        context("authorizeJudgeUpload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeJudgeUpload(contest, member)
                }
            }
        }

        context("authorizeContestantUpload") {
            test("should allow contestant upload when contest has started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.minusHours(1),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build()

                // Should not throw exception
                sut.authorizeContestantUpload(contest, member)
            }

            test("should throw ForbiddenException when contest has not started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.plusHours(1),
                        endAt = now.plusHours(2),
                    )
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeContestantUpload(contest, member)
                }
            }
        }

        context("authorizePublicUpload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizePublicUpload(contest)
                }
            }
        }

        context("authorizeAdminDownload") {
            test("should allow admin download") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                // Should not throw exception
                sut.authorizeAdminDownload(contest, member, attachment)
            }
        }

        context("authorizeJudgeDownload") {
            test("should allow judge download when contest has started") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                // Should not throw exception
                sut.authorizeJudgeDownload(contest, member, attachment)
            }
        }

        context("authorizeContestantDownload") {
            test("should allow contestant download of own attachment") {
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(id = memberId)
                val attachment = AttachmentMockBuilder.build(member = member)

                // Should not throw exception
                sut.authorizeContestantDownload(contest, member, attachment)
            }

            test("should throw ForbiddenException when attachment belongs to different member") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(id = UuidCreator.getTimeOrderedEpoch())
                val differentMember = MemberMockBuilder.build(id = UuidCreator.getTimeOrderedEpoch())
                val attachment = AttachmentMockBuilder.build(member = differentMember)

                shouldThrow<ForbiddenException> {
                    sut.authorizeContestantDownload(contest, member, attachment)
                }
            }
        }

        context("authorizePublicDownload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizePublicDownload(contest, attachment)
                }
            }
        }
    })
