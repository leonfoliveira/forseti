package io.github.leonfoliveira.judge.common.service.attachment

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.port.AttachmentBucketAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.Optional
import java.util.UUID

class AttachmentServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucketAdapter = mockk<AttachmentBucketAdapter>(relaxed = true)

        val sut =
            AttachmentService(
                contestRepository = contestRepository,
                attachmentRepository = attachmentRepository,
                attachmentBucketAdapter = attachmentBucketAdapter,
            )

        beforeEach {
            clearAllMocks()
        }

        context("upload") {
            test("should upload an attachment") {
                val contest = ContestMockBuilder.build()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findById(contest.id) } returns Optional.of(contest)
                every { attachmentRepository.save(any<Attachment>()) } answers { firstArg() }

                val attachment = sut.upload(contest.id, filename, contentType, context, bytes)

                attachment.contest shouldBe contest
                attachment.filename shouldBe "test.txt"
                attachment.contentType shouldBe "text/plain"
                verify { attachmentRepository.save(attachment) }
                verify { attachmentBucketAdapter.upload(attachment, bytes) }
            }

            test("should throw NotFoundException when contest does not exist") {
                val contestId = UUID.randomUUID()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findById(contestId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.upload(contestId, filename, contentType, context, bytes)
                }.message shouldBe "Could not find contest with id = $contestId"
            }
        }

        context("download") {
            test("should throw NotFoundException when attachment does not exist") {
                val id = UUID.randomUUID()
                every { attachmentRepository.findById(id) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.download(id)
                }.message shouldBe "Could not find attachment with id = $id"
            }

            test("should download an attachment") {
                val id = UUID.randomUUID()
                val attachment = AttachmentMockBuilder.build(id = id)
                every { attachmentRepository.findById(id) } returns Optional.of(attachment)
                val bytes = ByteArray(10) { it.toByte() }
                every { attachmentBucketAdapter.download(attachment) } returns bytes

                val result = sut.download(id)

                result.attachment shouldBe attachment
                result.bytes shouldBe bytes
            }
        }
    })
