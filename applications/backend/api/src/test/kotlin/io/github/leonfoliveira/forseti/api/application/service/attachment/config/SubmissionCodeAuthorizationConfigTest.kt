package io.github.leonfoliveira.forseti.api.application.service.attachment.config

import io.github.leonfoliveira.forseti.api.adapter.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

class SubmissionCodeAuthorizationConfigTest :
    FunSpec({
        val contestAuthFilter = mockk<ContestAuthFilter>(relaxed = true)

        val sut =
            SubmissionCodeAuthorizationConfig(
                contestAuthFilter = contestAuthFilter,
            )

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
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.authorizeAdminUpload(contestId, member)
                }
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
            test("should check if contest started and member belongs to contest") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                justRun { contestAuthFilter.checkIfStarted(contestId) }
                justRun { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeContestantUpload(contestId, member)

                verify(exactly = 1) { contestAuthFilter.checkIfStarted(contestId) }
                verify(exactly = 1) { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
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
                justRun { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeAdminDownload(contestId, member, attachment)

                verify(exactly = 1) { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeJudgeDownload") {
            test("should check if contest started and member belongs to contest") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build()
                justRun { contestAuthFilter.checkIfStarted(contestId) }
                justRun { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeJudgeDownload(contestId, member, attachment)

                verify(exactly = 1) { contestAuthFilter.checkIfStarted(contestId) }
                verify(exactly = 1) { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            }
        }

        context("authorizeContestantDownload") {
            test("should check if contest started and member belongs to contest") {
                val contestId = UUID.randomUUID()
                val memberId = UUID.randomUUID()
                val member = MemberMockBuilder.build(id = memberId)
                val attachment = AttachmentMockBuilder.build(member = member)
                justRun { contestAuthFilter.checkIfStarted(contestId) }
                justRun { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }

                sut.authorizeContestantDownload(contestId, member, attachment)

                verify(exactly = 1) { contestAuthFilter.checkIfStarted(contestId) }
                verify(exactly = 1) { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
            }

            test("should throw ForbiddenException when attachment belongs to different member") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build(id = UUID.randomUUID())
                val differentMember = MemberMockBuilder.build(id = UUID.randomUUID())
                val attachment = AttachmentMockBuilder.build(member = differentMember)
                justRun { contestAuthFilter.checkIfStarted(contestId) }
                justRun { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }

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
