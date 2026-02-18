package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import java.time.OffsetDateTime

class SubmissionCodeAuthorizationConfigTest :
    FunSpec({
        val sut = SubmissionCodeAuthorizationConfig()

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType() } returns contestAuthorizer
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

        context("authorizeStaffUpload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeStaffUpload(contest, member)
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

                shouldNotThrow<ForbiddenException> {
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

                shouldNotThrow<ForbiddenException> {
                    sut.authorizeAdminDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeStaffDownload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeStaffDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeJudgeDownload") {
            test("should allow judge download when contest has started") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldNotThrow<ForbiddenException> {
                    sut.authorizeJudgeDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeContestantDownload") {
            test("should allow contestant download of own attachment") {
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(id = memberId)
                val attachment = AttachmentMockBuilder.build(member = member)

                shouldNotThrow<ForbiddenException> {
                    sut.authorizeContestantDownload(contest, member, attachment)
                }
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
