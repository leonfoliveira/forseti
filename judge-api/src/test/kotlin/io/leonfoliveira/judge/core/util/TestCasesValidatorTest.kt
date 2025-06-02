package io.leonfoliveira.judge.core.util

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.nio.charset.StandardCharsets
import java.util.UUID

class TestCasesValidatorTest : FunSpec({
    val bucketAdapter = mockk<BucketAdapter>()
    val sut = TestCasesValidator(bucketAdapter)

    context("validate") {
        test("validate throws exception for non-CSV file") {
            val exception =
                shouldThrow<BusinessException> {
                    sut.validate(AttachmentMockFactory.build(contentType = "text/plain"))
                }

            exception.message shouldBe "Test cases file must be a CSV file"
        }

        test("validate succeeds for valid CSV") {
            val attachmentKey = UUID.randomUUID()
            val validCsv = "input1,output1\ninput2,output2".toByteArray(StandardCharsets.UTF_8)
            every { bucketAdapter.download(attachmentKey) } returns validCsv

            sut.validate(AttachmentMockFactory.build(key = attachmentKey))

            verify { bucketAdapter.download(attachmentKey) }
        }

        test("validate throws exception for empty CSV file") {
            val attachmentKey = UUID.randomUUID()
            val emptyCsv = "".toByteArray(StandardCharsets.UTF_8)
            every { bucketAdapter.download(attachmentKey) } returns emptyCsv

            val exception =
                shouldThrow<BusinessException> {
                    sut.validate(AttachmentMockFactory.build(key = attachmentKey))
                }

            exception.message shouldBe "Test cases file is empty"
        }

        test("validate throws exception for CSV with invalid row size") {
            val attachmentKey = UUID.randomUUID()
            val invalidCsv = "input1,output1\ninput2".toByteArray(StandardCharsets.UTF_8)
            every { bucketAdapter.download(attachmentKey) } returns invalidCsv

            val exception =
                shouldThrow<BusinessException> {
                    sut.validate(AttachmentMockFactory.build(key = attachmentKey))
                }

            exception.message shouldBe "Test case #2 does not have exactly input and output columns"
        }
    }
})
