package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class AnnouncementTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create an announcement with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member()

            val announcement =
                Announcement(
                    contest = contest,
                    member = member,
                    text = "This is a test announcement.",
                )

            assertNotNull(announcement.id)
            assertEquals(now, announcement.createdAt)
            assertEquals(now, announcement.updatedAt)
            assertNull(announcement.deletedAt)
            assertEquals(1L, announcement.version)
            assertEquals(contest, announcement.contest)
            assertEquals(member, announcement.member)
            assertEquals("This is a test announcement.", announcement.text)
        }
    }
}
