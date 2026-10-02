package com.forsetijudge.core.application.helper.problem

import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.test.factory.MockEntityFactory
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class TestCasesValidatorTest {
    private val bucket = mock<AttachmentBucket>()
    private val validator = TestCasesValidator(bucket)
    private val attachment = MockEntityFactory.attachment(contentType = "text/csv")

    @Test
    fun `accepts a csv file with two columns per row`() {
        whenever(bucket.download(attachment)).thenReturn("1,2\n3,4\n".toByteArray())

        validator.validate(attachment)

        verify(bucket).download(attachment)
    }

    @Test
    fun `rejects non csv without downloading`() {
        val nonCsv = MockEntityFactory.attachment(contentType = "application/json")

        assertThrows(BusinessException::class.java) { validator.validate(nonCsv) }

        verify(bucket, never()).download(nonCsv)
    }

    @Test
    fun `rejects empty content and rows with the wrong number of columns`() {
        whenever(bucket.download(attachment)).thenReturn(ByteArray(0))
        assertThrows(BusinessException::class.java) { validator.validate(attachment) }

        whenever(bucket.download(attachment)).thenReturn("only-one-column\n".toByteArray())
        assertThrows(BusinessException::class.java) { validator.validate(attachment) }

        whenever(bucket.download(attachment)).thenReturn("a,b,c\n".toByteArray())
        assertThrows(BusinessException::class.java) { validator.validate(attachment) }
    }
}
