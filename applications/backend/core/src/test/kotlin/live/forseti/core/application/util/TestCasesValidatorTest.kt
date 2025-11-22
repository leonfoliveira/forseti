package live.forseti.core.application.util

import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import live.forseti.core.domain.entity.AttachmentMockBuilder
import live.forseti.core.domain.exception.BusinessException
import live.forseti.core.port.driven.AttachmentBucket

class TestCasesValidatorTest :
    FunSpec({
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut = TestCasesValidator(attachmentBucket)

        beforeEach {
            clearAllMocks()
        }

        context("validate") {
            test("should throw BusinessException when test cases file is not a CSV") {
                val testCases = AttachmentMockBuilder.build(contentType = "application/json")

                shouldThrow<BusinessException> {
                    sut.validate(testCases)
                }.message shouldBe "Test cases file must be a CSV file"
            }

            test("should throw BusinessException when test cases file is empty") {
                val testCases = AttachmentMockBuilder.build(contentType = "text/csv")
                val bytes = "".toByteArray()
                every { attachmentBucket.download(testCases) } returns bytes

                shouldThrow<BusinessException> {
                    sut.validate(testCases)
                }.message shouldBe "Test cases file is empty"
            }

            test("should throw BusinessException when test case does not have exactly input and output columns") {
                val testCases = AttachmentMockBuilder.build(contentType = "text/csv")
                val bytes = "input1,output1\ninput2\n".toByteArray()
                every { attachmentBucket.download(testCases) } returns bytes

                shouldThrow<BusinessException> {
                    sut.validate(testCases)
                }.message shouldBe "Test case #2 does not have exactly input and output columns"
            }

            test("should validate test cases successfully when all conditions are met") {
                val testCases = AttachmentMockBuilder.build(contentType = "text/csv")
                val bytes = "input1,output1\ninput2,output2\n".toByteArray()
                every { attachmentBucket.download(testCases) } returns bytes

                shouldNotThrow<Exception> {
                    sut.validate(testCases)
                }
            }
        }
    })
