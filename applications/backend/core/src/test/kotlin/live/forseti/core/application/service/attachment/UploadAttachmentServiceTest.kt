package live.forseti.core.application.service.attachment

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.ContestMockBuilder
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.AttachmentBucket
import live.forseti.core.port.driven.repository.AttachmentRepository
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driven.repository.MemberRepository
import java.util.UUID

class UploadAttachmentServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut =
            UploadAttachmentService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                attachmentRepository = attachmentRepository,
                attachmentBucket = attachmentBucket,
            )

        beforeEach {
            clearAllMocks()
        }

        context("upload") {
            test("should upload an attachment") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(member.id) } returns member
                every { attachmentRepository.save(any<Attachment>()) } answers { firstArg() }

                val attachment = sut.upload(contest.id, member.id, filename, contentType, context, bytes)

                attachment.contest shouldBe contest
                attachment.member shouldBe member
                attachment.filename shouldBe "test.txt"
                attachment.contentType shouldBe "text/plain"
                verify { attachmentRepository.save(attachment) }
                verify { attachmentBucket.upload(attachment, bytes) }
            }

            test("should throw NotFoundException when contest does not exist") {
                val contestId = UUID.randomUUID()
                val member = MemberMockBuilder.build()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contestId) } returns null
                every { memberRepository.findEntityById(member.id) } returns member

                shouldThrow<NotFoundException> {
                    sut.upload(contestId, member.id, filename, contentType, context, bytes)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw NotFoundException when member does not exist") {
                val contest = ContestMockBuilder.build()
                val memberId = UUID.randomUUID()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.upload(contest.id, memberId, filename, contentType, context, bytes)
                }.message shouldBe "Could not find member with id = $memberId"
            }
        }
    })
