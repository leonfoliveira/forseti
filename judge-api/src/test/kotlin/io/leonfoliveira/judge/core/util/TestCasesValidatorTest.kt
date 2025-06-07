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

class TestCasesValidatorTest : FunSpec({
    val bucketAdapter = mockk<BucketAdapter>()
    val sut = TestCasesValidator(bucketAdapter)

    val attachment = AttachmentMockFactory.build(contentType = "text/csv")

    context("validate") {
        test("validate throws exception for non-CSV file") {
            val exception =
                shouldThrow<BusinessException> {
                    sut.validate(AttachmentMockFactory.build(contentType = "text/plain"))
                }

            exception.message shouldBe "Test cases file must be a CSV file"
        }

        test("validate succeeds for valid CSV") {
            val validCsv = "input1,output1\ninput2,output2".toByteArray(StandardCharsets.UTF_8)
            every { bucketAdapter.download(attachment) } returns validCsv

            sut.validate(attachment)

            verify { bucketAdapter.download(attachment) }
        }

        test("validate throws exception for empty CSV file") {
            val emptyCsv = "".toByteArray(StandardCharsets.UTF_8)
            every { bucketAdapter.download(attachment) } returns emptyCsv

            val exception =
                shouldThrow<BusinessException> {
                    sut.validate(attachment)
                }

            exception.message shouldBe "Test cases file is empty"
        }

        test("validate throws exception for CSV with invalid row size") {
            val invalidCsv = "input1,output1\ninput2".toByteArray(StandardCharsets.UTF_8)
            every { bucketAdapter.download(attachment) } returns invalidCsv

            val exception =
                shouldThrow<BusinessException> {
                    sut.validate(attachment)
                }

            exception.message shouldBe "Test case #2 does not have exactly input and output columns"
        }
    }
})
