package com.forsetijudge.core.application.helper.problem

import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class TestCasesValidatorTest {
    private val attachmentBucket = mock<AttachmentBucket>()
    private val testCasesValidator = TestCasesValidator(attachmentBucket)

    private val testCases = MockEntityFactory.attachment(contentType = "text/csv")

    @Test
    fun `should throw BusinessException when test cases file is not a CSV file`() {
        val invalidTestCases = MockEntityFactory.attachment(contentType = "application/json")

        assertThrows(BusinessException::class.java) {
            testCasesValidator.validate(invalidTestCases)
        }
    }

    @Test
    fun `should throw BusinessException when test cases file is empty`() {
        val emptyTestCases = MockEntityFactory.attachment(contentType = "text/csv")
        whenever(attachmentBucket.download(emptyTestCases)).thenReturn(ByteArray(0))

        assertThrows(BusinessException::class.java) {
            testCasesValidator.validate(emptyTestCases)
        }
    }

    @Test
    fun `should throw BusinessException when test case does not have exactly input and output columns`() {
        val invalidTestCases = MockEntityFactory.attachment(contentType = "text/csv")
        val invalidCsvContent = "input1,output1\ninput2"
        whenever(attachmentBucket.download(invalidTestCases)).thenReturn(invalidCsvContent.toByteArray())

        assertThrows(BusinessException::class.java) {
            testCasesValidator.validate(invalidTestCases)
        }
    }

    @Test
    fun `should not throw any exception when test cases file is valid`() {
        val validTestCases = MockEntityFactory.attachment(contentType = "text/csv")
        val validCsvContent = "input1,output1\ninput2,output2"
        whenever(attachmentBucket.download(validTestCases)).thenReturn(validCsvContent.toByteArray())

        assertDoesNotThrow {
            testCasesValidator.validate(validTestCases)
        }
    }
}
