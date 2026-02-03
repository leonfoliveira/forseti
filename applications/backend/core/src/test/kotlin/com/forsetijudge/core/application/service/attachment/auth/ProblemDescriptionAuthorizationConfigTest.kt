package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import java.time.OffsetDateTime

class ProblemDescriptionAuthorizationConfigTest :
    FunSpec({
        val sut = ProblemDescriptionAuthorizationConfig()

        beforeEach {
            clearAllMocks()
        }

        context("getContext") {
            test("should return PROBLEM_DESCRIPTION context") {
                sut.getContext() shouldBe Attachment.Context.PROBLEM_DESCRIPTION
            }
        }

        context("authorizeAdminUpload") {
            test("should allow admin upload") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()

                // Should not throw exception
                sut.authorizeAdminUpload(contest, member)
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
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
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
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.minusHours(1),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                // Should not throw exception
                sut.authorizeJudgeDownload(contest, member, attachment)
            }

            test("should throw ForbiddenException when contest has not started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.plusHours(1),
                        endAt = now.plusHours(2),
                    )
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeJudgeDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeContestantDownload") {
            test("should allow contestant download when contest has started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.minusHours(1),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                // Should not throw exception
                sut.authorizeContestantDownload(contest, member, attachment)
            }

            test("should throw ForbiddenException when contest has not started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.plusHours(1),
                        endAt = now.plusHours(2),
                    )
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeContestantDownload(contest, member, attachment)
                }
            }
        }

        context("authorizePublicDownload") {
            test("should allow public download when contest has started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.minusHours(1),
                        endAt = now.plusHours(1),
                    )
                val attachment = AttachmentMockBuilder.build()

                // Should not throw exception
                sut.authorizePublicDownload(contest, attachment)
            }

            test("should throw ForbiddenException when contest has not started") {
                val now = OffsetDateTime.now()
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.plusHours(1),
                        endAt = now.plusHours(2),
                    )
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizePublicDownload(contest, attachment)
                }
            }
        }
    })
