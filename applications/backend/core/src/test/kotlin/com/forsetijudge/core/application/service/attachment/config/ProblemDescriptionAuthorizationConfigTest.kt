package com.forsetijudge.core.application.service.attachment.config

import com.forsetijudge.core.application.service.contest.AuthorizeContestService
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.verify

class ProblemDescriptionAuthorizationConfigTest :
    FunSpec({
        val authorizeContestService = mockk<AuthorizeContestService>(relaxed = true)

        val sut =
            ProblemDescriptionAuthorizationConfig(
                authorizeContestService = authorizeContestService,
            )

        beforeEach {
            clearAllMocks()
        }

        context("getContext") {
            test("should return PROBLEM_DESCRIPTION context") {
                sut.getContext() shouldBe Attachment.Context.PROBLEM_DESCRIPTION
            }
        }

        context("authorizeAdminUpload") {
            test("should check if member belongs to contest") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()
                justRun { authorizeContestService.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeAdminUpload(contestId, member)

                verify(exactly = 1) { authorizeContestService.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeJudgeUpload") {
            test("should throw ForbiddenException") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeJudgeUpload(contestId, member)
                }
            }
        }

        context("authorizeContestantUpload") {
            test("should throw ForbiddenException") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeContestantUpload(contestId, member)
                }
            }
        }

        context("authorizePublicUpload") {
            test("should throw ForbiddenException") {
                val contestId = UuidCreator.getTimeOrderedEpoch()

                shouldThrow<ForbiddenException> {
                    sut.authorizePublicUpload(contestId)
                }
            }
        }

        context("authorizeAdminDownload") {
            test("should check if member belongs to contest") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()
                justRun { authorizeContestService.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeAdminDownload(contestId, member, attachment)

                verify(exactly = 1) { authorizeContestService.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeJudgeDownload") {
            test("should check if contest started and member belongs to contest") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()
                justRun { authorizeContestService.checkIfStarted(contestId) }
                justRun { authorizeContestService.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeJudgeDownload(contestId, member, attachment)

                verify(exactly = 1) { authorizeContestService.checkIfStarted(contestId) }
                verify(exactly = 1) { authorizeContestService.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeContestantDownload") {
            test("should check if contest started and member belongs to contest") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()
                justRun { authorizeContestService.checkIfStarted(contestId) }
                justRun { authorizeContestService.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeContestantDownload(contestId, member, attachment)

                verify(exactly = 1) { authorizeContestService.checkIfStarted(contestId) }
                verify(exactly = 1) { authorizeContestService.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizePublicDownload") {
            test("should throw ForbiddenException") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachment = AttachmentMockBuilder.build()

                sut.authorizePublicDownload(contestId, attachment)

                verify(exactly = 1) { authorizeContestService.checkIfStarted(contestId) }
            }
        }
    })
