package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class PrintRequestTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a print request with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val submission = MockEntityFactory.submission()

            val printRequest =
                PrintRequest(
                    submission = submission,
                    status = PrintRequest.Status.COMPLETED,
                )

            assertNotNull(printRequest.id)
            assertEquals(now, printRequest.createdAt)
            assertEquals(now, printRequest.updatedAt)
            assertNull(printRequest.deletedAt)
            assertEquals(1L, printRequest.version)
            assertEquals(submission, printRequest.submission)
            assertEquals(PrintRequest.Status.COMPLETED, printRequest.status)
        }
    }
}
