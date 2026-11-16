package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class ClarificationTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a clarification with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member()
            val problem = MockEntityFactory.problem()

            val clarification =
                Clarification(
                    contest = contest,
                    problem = problem,
                    member = member,
                    text = "This is a test clarification.",
                    answer =
                        Clarification.Answer(
                            member = member,
                            text = "This is a test answer.",
                        ),
                )

            assertNotNull(clarification.id)
            assertEquals(now, clarification.createdAt)
            assertEquals(now, clarification.updatedAt)
            assertNull(clarification.deletedAt)
            assertEquals(1L, clarification.version)
            assertEquals(contest, clarification.contest)
            assertEquals(problem, clarification.problem)
            assertEquals(member, clarification.member)
            assertEquals("This is a test clarification.", clarification.text)
            assertEquals(member, clarification.answer?.member)
            assertEquals("This is a test answer.", clarification.answer?.text)
        }
    }
}
