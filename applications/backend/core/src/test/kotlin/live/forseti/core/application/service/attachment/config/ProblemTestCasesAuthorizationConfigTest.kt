package live.forseti.core.application.service.attachment.config

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.application.service.contest.AuthorizeContestService
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.AttachmentMockBuilder
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.exception.ForbiddenException
import java.util.UUID

class ProblemTestCasesAuthorizationConfigTest :
    FunSpec({
        val authorizeContestService = mockk<AuthorizeContestService>(relaxed = true)

        val sut =
            ProblemTestCasesAuthorizationConfig(
                authorizeContestService = authorizeContestService,
            )

        beforeEach {
            clearAllMocks()
        }

        context("getContext") {
            test("should return PROBLEM_TEST_CASES context") {
                sut.getContext() shouldBe Attachment.Context.PROBLEM_TEST_CASES
            }
        }

        context("authorizeAdminUpload") {
            test("should check if member belongs to contest") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                justRun { authorizeContestService.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeAdminUpload(contestId, member)

                verify(exactly = 1) { authorizeContestService.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeJudgeUpload") {
            test("should throw ForbiddenException") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeJudgeUpload(contestId, member)
                }
            }
        }

        context("authorizeContestantUpload") {
            test("should throw ForbiddenException") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeContestantUpload(contestId, member)
                }
            }
        }

        context("authorizePublicUpload") {
            test("should throw ForbiddenException") {
                val contestId = UUID.randomUUID()

                shouldThrow<ForbiddenException> {
                    sut.authorizePublicUpload(contestId)
                }
            }
        }

        context("authorizeAdminDownload") {
            test("should check if member belongs to contest") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()
                justRun { authorizeContestService.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeAdminDownload(contestId, member, attachment)

                verify(exactly = 1) { authorizeContestService.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeJudgeDownload") {
            test("should throw ForbiddenException") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeJudgeDownload(contestId, member, attachment)
                }
            }
        }

        context("authorizeContestantDownload") {
            test("should throw ForbiddenException") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeContestantDownload(contestId, member, attachment)
                }
            }
        }

        context("authorizePublicDownload") {
            test("should throw ForbiddenException") {
                val contestId = UUID.randomUUID()
                val attachment = AttachmentMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizePublicDownload(contestId, attachment)
                }
            }
        }
    })
