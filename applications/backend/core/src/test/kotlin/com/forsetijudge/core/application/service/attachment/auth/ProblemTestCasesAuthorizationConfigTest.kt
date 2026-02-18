package com.forsetijudge.core.application.service.attachment.auth

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

class ProblemTestCasesAuthorizationConfigTest :
    FunSpec({
        val sut = ProblemTestCasesAuthorizationConfig()

        beforeEach {
            clearAllMocks()
        }

        context("getContext") {
            test("should return PROBLEM_TEST_CASES context") {
                sut.getContext() shouldBe Attachment.Context.PROBLEM_TEST_CASES
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
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeJudgeDownload(contest, member, attachment)
                }
            }
        }

        context("authorizeContestantDownload") {
            test("should throw ForbiddenException") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

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
