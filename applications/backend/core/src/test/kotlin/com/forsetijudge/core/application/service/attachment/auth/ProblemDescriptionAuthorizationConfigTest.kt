package com.forsetijudge.core.application.service.attachment.auth

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import java.time.OffsetDateTime

class ProblemDescriptionAuthorizationConfigTest :
    FunSpec({
        val sut = ProblemDescriptionAuthorizationConfig()

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType() } returns contestAuthorizer
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

                shouldNotThrow<ForbiddenException> {
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

                shouldNotThrow<ForbiddenException> {
                    sut.authorizeAdminDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeStaffDownload") {
            test("should allow staff download") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldNotThrow<ForbiddenException> {
                    sut.authorizeStaffDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeJudgeDownload") {
            test("should allow judge download") {
                val contest =
                    ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldNotThrow<ForbiddenException> {
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

                shouldNotThrow<ForbiddenException> {
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

                shouldNotThrow<ForbiddenException> {
                    sut.authorizePublicDownload(contest, attachment)
                }
            }
        }
    })
