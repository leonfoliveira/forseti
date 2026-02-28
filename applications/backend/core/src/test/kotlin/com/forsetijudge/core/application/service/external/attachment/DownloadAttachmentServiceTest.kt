package com.forsetijudge.core.application.service.external.attachment

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.attachment.DownloadAttachmentUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class DownloadAttachmentServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut =
            DownloadAttachmentService(
                memberRepository = memberRepository,
                attachmentRepository = attachmentRepository,
                attachmentBucket = attachmentBucket,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        fun assertDownloadSuccessfully(
            contest: Contest = ContestMockBuilder.build(),
            member: Member? = MemberMockBuilder.build(),
            attachment: Attachment? = null,
        ) {
            val actualMember = member ?: MemberMockBuilder.build(id = contextContestId, contest = contest)
            val actualAttachment =
                attachment ?: AttachmentMockBuilder.build(
                    contest = contest,
                    member = actualMember,
                )

            ExecutionContextMockBuilder.build(contest.id, actualMember.id)

            every { memberRepository.findByIdAndContestIdOrContestIsNull(actualMember.id, contest.id) } returns actualMember
            every { attachmentRepository.findByIdAndContestId(actualAttachment.id, contest.id) } returns actualAttachment
            every { attachmentBucket.download(actualAttachment) } returns ByteArray(0)

            val result =
                sut.execute(
                    DownloadAttachmentUseCase.Command(
                        attachmentId = actualAttachment.id,
                    ),
                )

            result.first shouldBe actualAttachment
            result.second shouldBe ByteArray(0)
        }

        fun assertForbidden(
            contest: Contest = ContestMockBuilder.build(),
            member: Member? = MemberMockBuilder.build(),
            attachment: Attachment? = null,
            message: String,
        ) {
            val actualMember = member
            val actualAttachment =
                attachment ?: AttachmentMockBuilder.build(
                    contest = contest,
                    member = actualMember ?: MemberMockBuilder.build(contest = contest),
                )

            ExecutionContextMockBuilder.build(contest.id, actualMember?.id)

            if (member != null) {
                every { memberRepository.findByIdAndContestIdOrContestIsNull(member.id, contest.id) } returns member
            }
            every { attachmentRepository.findByIdAndContestId(any(), any()) } returns actualAttachment

            shouldThrow<ForbiddenException> {
                sut.execute(
                    DownloadAttachmentUseCase.Command(attachmentId = actualAttachment.id),
                )
            }
        }

        test("should throw NotFoundException if attachment does not exists") {
            every { attachmentRepository.findByIdAndContestId(any(), any()) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(
                    DownloadAttachmentUseCase.Command(
                        attachmentId = IdGenerator.getUUID(),
                    ),
                )
            }
        }

        context("EXECUTION_OUTPUT") {
            context("ROOT") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                    )
                }
            }

            context("ADMIN") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                    )
                }
            }

            context("STAFF") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                        message = "Staff cannot download execution outputs",
                    )
                }
            }

            context("JUDGE") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                        message = "Contestant cannot download execution outputs",
                    )
                }
            }

            context("CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                        message = "Contestant cannot download execution outputs",
                    )
                }
            }

            context("GUEST") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = null,
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            ),
                        message = "Public cannot download execution outputs",
                    )
                }
            }
        }

        context("PROBLEM_DESCRIPTION") {
            test("ROOT, ADMIN, STAFF, JUDGE can download regardless of contest start") {
                val notStarted = ContestMockBuilder.build()

                assertDownloadSuccessfully(
                    contest = notStarted,
                    member = MemberMockBuilder.build(type = Member.Type.ROOT, contest = notStarted),
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = MemberMockBuilder.build(type = Member.Type.ROOT, contest = notStarted),
                        ),
                )

                assertDownloadSuccessfully(
                    contest = notStarted,
                    member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = notStarted),
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = notStarted),
                        ),
                )

                assertDownloadSuccessfully(
                    contest = notStarted,
                    member = MemberMockBuilder.build(type = Member.Type.STAFF, contest = notStarted),
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = MemberMockBuilder.build(type = Member.Type.STAFF, contest = notStarted),
                        ),
                )

                assertDownloadSuccessfully(
                    contest = notStarted,
                    member = MemberMockBuilder.build(type = Member.Type.JUDGE, contest = notStarted),
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = MemberMockBuilder.build(type = Member.Type.JUDGE, contest = notStarted),
                        ),
                )
            }

            test("Contestant and Guest can download only after contest started") {
                val started = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))

                assertDownloadSuccessfully(
                    contest = started,
                    member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = started),
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = started,
                            member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = started),
                        ),
                )

                assertDownloadSuccessfully(
                    contest = started,
                    member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = started),
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = started,
                            member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = started),
                        ),
                )

                assertDownloadSuccessfully(
                    contest = started,
                    member = null,
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = started,
                            member = MemberMockBuilder.build(contest = started),
                        ),
                )

                val notStarted = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val unofficialContestant =
                    MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = notStarted)
                val contestant = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = notStarted)

                assertForbidden(
                    contest = notStarted,
                    member = unofficialContestant,
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = unofficialContestant,
                        ),
                    message = "Contest has not started yet",
                )

                assertForbidden(
                    contest = notStarted,
                    member = contestant,
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = contestant,
                        ),
                    message = "Contest has not started yet",
                )

                assertForbidden(
                    contest = notStarted,
                    member = null,
                    attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.PROBLEM_DESCRIPTION,
                            contest = notStarted,
                            member = MemberMockBuilder.build(contest = notStarted),
                        ),
                    message = "Contest has not started yet",
                )
            }
        }

        context("PROBLEM_TEST_CASES") {
            context("ROOT") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                    )
                }
            }

            context("ADMIN") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                    )
                }
            }

            context("STAFF") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                    )
                }
            }

            context("JUDGE") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                        message = "Contestants cannot download test cases attachments",
                    )
                }
            }

            context("CONTESTANT") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.CONTESTANT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                        message = "Contestants cannot download test cases attachments",
                    )
                }
            }

            context("GUEST") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = null,
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            ),
                        message = "Guest users cannot download test cases attachments",
                    )
                }
            }
        }

        context("SUBMISSION_CODE") {
            context("ROOT") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.SUBMISSION_CODE,
                            ),
                    )
                }
            }

            context("ADMIN") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.SUBMISSION_CODE,
                            ),
                    )
                }
            }

            context("JUDGE") {
                test("should download successfully") {
                    assertDownloadSuccessfully(
                        member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.SUBMISSION_CODE,
                            ),
                    )
                }
            }

            context("STAFF") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = MemberMockBuilder.build(type = Member.Type.STAFF),
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.SUBMISSION_CODE,
                            ),
                        message = "Staff cannot download submission code attachments",
                    )
                }
            }

            context("UNOFFICIAL_CONTESTANT") {
                test("should download their own submission code") {
                    val contest =
                        ContestMockBuilder.build(
                            startAt = OffsetDateTime.now().minusHours(1),
                            endAt = OffsetDateTime.now().plusHours(1),
                        )
                    val member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = contest)
                    val attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.SUBMISSION_CODE,
                            contest = contest,
                            member = member,
                        )

                    assertDownloadSuccessfully(
                        contest = contest,
                        member = member,
                        attachment = attachment,
                    )
                }

                test("should throw ForbiddenException when contest has not started") {
                    val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                    val member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = contest)
                    val attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.SUBMISSION_CODE,
                            contest = contest,
                            member = member,
                        )

                    assertForbidden(
                        contest = contest,
                        member = member,
                        attachment = attachment,
                        message = "Contest has not started yet",
                    )
                }

                test("should throw ForbiddenException when trying to download others' submission code") {
                    val contest =
                        ContestMockBuilder.build(
                            startAt = OffsetDateTime.now().minusHours(1),
                            endAt = OffsetDateTime.now().plusHours(1),
                        )
                    val member = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = contest)
                    val other = MemberMockBuilder.build(type = Member.Type.UNOFFICIAL_CONTESTANT, contest = contest)
                    val attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.SUBMISSION_CODE,
                            contest = contest,
                            member = other,
                        )

                    assertForbidden(
                        contest = contest,
                        member = member,
                        attachment = attachment,
                        message = "Contestants can only download their own submission code attachments",
                    )
                }
            }

            context("CONTESTANT") {
                test("should download their own submission code") {
                    val contest =
                        ContestMockBuilder.build(
                            startAt = OffsetDateTime.now().minusHours(1),
                            endAt = OffsetDateTime.now().plusHours(1),
                        )
                    val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                    val attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.SUBMISSION_CODE,
                            contest = contest,
                            member = member,
                        )

                    assertDownloadSuccessfully(
                        contest = contest,
                        member = member,
                        attachment = attachment,
                    )
                }

                test("should throw ForbiddenException when contest has not started") {
                    val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                    val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                    val attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.SUBMISSION_CODE,
                            contest = contest,
                            member = member,
                        )

                    assertForbidden(
                        contest = contest,
                        member = member,
                        attachment = attachment,
                        message = "Contest has not started yet",
                    )
                }

                test("should throw ForbiddenException when trying to download others' submission code") {
                    val contest =
                        ContestMockBuilder.build(
                            startAt = OffsetDateTime.now().minusHours(1),
                            endAt = OffsetDateTime.now().plusHours(1),
                        )
                    val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                    val other = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                    val attachment =
                        AttachmentMockBuilder.build(
                            context = Attachment.Context.SUBMISSION_CODE,
                            contest = contest,
                            member = other,
                        )

                    assertForbidden(
                        contest = contest,
                        member = member,
                        attachment = attachment,
                        message = "Contestants can only download their own submission code attachments",
                    )
                }
            }

            context("GUEST") {
                test("should throw ForbiddenException") {
                    assertForbidden(
                        member = null,
                        attachment =
                            AttachmentMockBuilder.build(
                                context = Attachment.Context.SUBMISSION_CODE,
                            ),
                        message = "Guest users cannot download submission code attachments",
                    )
                }
            }
        }
    })
