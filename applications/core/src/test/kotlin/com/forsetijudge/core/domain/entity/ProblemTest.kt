package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class ProblemTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a problem with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val contest = MockEntityFactory.contest()
            val description = MockEntityFactory.attachment()
            val testCases = MockEntityFactory.attachment()

            val problem =
                Problem(
                    contest = contest,
                    letter = 'A',
                    color = "#FF0000",
                    title = "Sample Problem",
                    description = description,
                    timeLimitMs = 1000,
                    memoryLimitMb = 256,
                    testCases = testCases,
                )

            assertNotNull(problem.id)
            assertEquals(now, problem.createdAt)
            assertEquals(now, problem.updatedAt)
            assertNull(problem.deletedAt)
            assertEquals(1L, problem.version)
            assertEquals(contest, problem.contest)
            assertEquals('A', problem.letter)
            assertEquals("#FF0000", problem.color)
            assertEquals("Sample Problem", problem.title)
            assertEquals(description, problem.description)
            assertEquals(1000, problem.timeLimitMs)
            assertEquals(256, problem.memoryLimitMb)
            assertEquals(testCases, problem.testCases)
        }
    }
}
