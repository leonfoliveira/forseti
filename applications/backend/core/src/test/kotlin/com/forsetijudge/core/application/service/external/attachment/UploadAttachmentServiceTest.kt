package com.forsetijudge.core.application.service.external.attachment

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.file.FileAnalyser
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.attachment.UploadAttachmentUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class UploadAttachmentServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)
        val fileAnalyser = mockk<FileAnalyser>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            UploadAttachmentService(
                attachmentRepository = attachmentRepository,
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                attachmentBucket = attachmentBucket,
                fileAnalyser = fileAnalyser,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        val command =
            UploadAttachmentUseCase.Command(
                filename = "test.txt",
                bytes = "Hello, World!".toByteArray(),
                contentType = "text/plain",
                context = Attachment.Context.SUBMISSION_CODE,
            )

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException when member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw ForbiddenException when contest has ended") {
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().minusHours(2),
                    endAt = OffsetDateTime.now().minusHours(1),
                )
            val member = MemberMockBuilder.build(contest = contest)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> {
                sut.execute(command)
            }
        }

        test("should throw ForbiddenException when content type does not match file content") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(contest = contest)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { fileAnalyser.validateContentType(any(), any()) } returns false

            shouldThrow<ForbiddenException> {
                sut.execute(command)
            }
        }

        fun assertUploadSuccessfully(
            contest: Contest = ContestMockBuilder.build(),
            member: Member = MemberMockBuilder.build(),
            context: Attachment.Context = Attachment.Context.PROBLEM_DESCRIPTION,
            contentType: String = "text/plain",
        ) {
            val actualMember = MemberMockBuilder.build(contest = contest, type = member.type)

            every { contestRepository.findById(contest.id) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id) } returns actualMember
            every { attachmentRepository.save(any()) } returnsArgument 0
            every { attachmentBucket.upload(any(), any()) } returns Unit
            every { fileAnalyser.validateContentType(any(), any()) } returns true

            ExecutionContextMockBuilder.build(contestId = contest.id, memberId = member.id)

            val (attachment, bytes) =
                sut.execute(
                    UploadAttachmentUseCase.Command(
                        filename = "test.txt",
                        bytes = "Hello, World!".toByteArray(),
                        contentType = contentType,
                        context = context,
                    ),
                )

            verify { attachmentRepository.save(match { it.id == attachment.id }) }
            bytes shouldBe "Hello, World!".toByteArray()
        }

        fun assertForbidden(
            contest: Contest = ContestMockBuilder.build(),
            member: Member = MemberMockBuilder.build(),
            context: Attachment.Context,
            contentType: String = "text/plain",
        ) {
            val actualMember = member

            every { contestRepository.findById(contest.id) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns actualMember
            every { fileAnalyser.validateContentType(any(), any()) } returns true

            ExecutionContextMockBuilder.build(contestId = contest.id, memberId = member.id)

            shouldThrow<ForbiddenException> {
                sut.execute(
                    UploadAttachmentUseCase.Command(
                        filename = "test.txt",
                        bytes = "Hello, World!".toByteArray(),
                        contentType = contentType,
                        context = context,
                    ),
                )
            }
        }

        context("EXECUTION_OUTPUT") {
            context("ROOT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        context = Attachment.Context.EXECUTION_OUTPUT,
                    )
                }
            }

            context("ADMIN") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        context = Attachment.Context.EXECUTION_OUTPUT,
                    )
                }
            }

            context("STAFF") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        context = Attachment.Context.EXECUTION_OUTPUT,
                    )
                }
            }

            context("JUDGE") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        context = Attachment.Context.EXECUTION_OUTPUT,
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        context = Attachment.Context.EXECUTION_OUTPUT,
                    )
                }
            }

            context("CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        context = Attachment.Context.EXECUTION_OUTPUT,
                    )
                }
            }
        }

        context("PROBLEM_DESCRIPTION") {
            context("ROOT") {
                test("should upload successfully") {
                    assertUploadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        contentType = "application/pdf",
                    )
                }
            }

            context("ADMIN") {
                test("should upload successfully") {
                    assertUploadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        contentType = "application/pdf",
                    )
                }
            }

            context("STAFF") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        contentType = "application/pdf",
                    )
                }
            }

            context("JUDGE") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        contentType = "application/pdf",
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        contentType = "application/pdf",
                    )
                }
            }

            context("CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        contentType = "application/pdf",
                    )
                }
            }
        }

        context("PROBLEM_TEST_CASES") {
            context("ROOT") {
                test("should upload successfully") {
                    assertUploadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        context = Attachment.Context.PROBLEM_TEST_CASES,
                        contentType = "text/csv",
                    )
                }
            }

            context("ADMIN") {
                test("should upload successfully") {
                    assertUploadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        context = Attachment.Context.PROBLEM_TEST_CASES,
                        contentType = "text/csv",
                    )
                }
            }

            context("STAFF") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        context = Attachment.Context.PROBLEM_TEST_CASES,
                        contentType = "text/csv",
                    )
                }
            }

            context("JUDGE") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        context = Attachment.Context.PROBLEM_TEST_CASES,
                        contentType = "text/csv",
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        context = Attachment.Context.PROBLEM_TEST_CASES,
                        contentType = "text/csv",
                    )
                }
            }

            context("CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        context = Attachment.Context.PROBLEM_TEST_CASES,
                        contentType = "text/csv",
                    )
                }
            }
        }

        context("SUBMISSION_CODE") {
            context("ROOT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }
            }

            context("ADMIN") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }
            }

            context("JUDGE") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }
            }

            context("STAFF") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should throw ForbiddenException when contest is not active") {
                    assertForbidden(
                        contest =
                            ContestMockBuilder.build(
                                startAt = OffsetDateTime.now().plusHours(1),
                            ),
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }

                test("should upload successfully") {
                    assertUploadSuccessfully(
                        contest =
                            ContestMockBuilder.build(
                                startAt = OffsetDateTime.now().minusHours(1),
                                endAt = OffsetDateTime.now().plusHours(1),
                            ),
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }
            }

            context("CONTESTANT") {
                test("should throw ForbiddenException when contest is not active") {
                    assertForbidden(
                        contest =
                            ContestMockBuilder.build(
                                startAt = OffsetDateTime.now().plusHours(1),
                            ),
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }

                test("should upload successfully") {
                    assertUploadSuccessfully(
                        contest =
                            ContestMockBuilder.build(
                                startAt = OffsetDateTime.now().minusHours(1),
                                endAt = OffsetDateTime.now().plusHours(1),
                            ),
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                }
            }
        }
    })
