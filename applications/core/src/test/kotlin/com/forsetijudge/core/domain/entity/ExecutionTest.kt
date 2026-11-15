package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class ExecutionTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create an execution with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val submission = MockEntityFactory.submission()
            val details = MockEntityFactory.attachment()

            val execution =
                Execution(
                    submission = submission,
                    answer = Submission.Answer.ACCEPTED,
                    totalTestCases = 10,
                    acceptedTestCases = 10,
                    maxCpuTimeMs = 1000,
                    maxClockTimeMs = 2000,
                    maxPeakMemoryKb = 1024,
                    details = details,
                )

            assertNotNull(execution.id)
            assertEquals(now, execution.createdAt)
            assertEquals(now, execution.updatedAt)
            assertNull(execution.deletedAt)
            assertEquals(1L, execution.version)
            assertEquals(submission, execution.submission)
            assertEquals(Submission.Answer.ACCEPTED, execution.answer)
            assertEquals(10, execution.totalTestCases)
            assertEquals(10, execution.acceptedTestCases)
            assertEquals(1000, execution.maxCpuTimeMs)
            assertEquals(2000, execution.maxClockTimeMs)
            assertEquals(1024, execution.maxPeakMemoryKb)
            assertEquals(details, execution.details)
        }
    }
}
