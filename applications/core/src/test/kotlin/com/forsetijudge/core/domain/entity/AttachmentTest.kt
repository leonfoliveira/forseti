package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class AttachmentTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create an attachment with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member()

            val attachment =
                Attachment(
                    contest = contest,
                    member = member,
                    filename = "test_file.txt",
                    contentType = "text/plain",
                    context = Attachment.Context.PROBLEM_DESCRIPTION,
                )

            assertNotNull(attachment.id)
            assertEquals(now, attachment.createdAt)
            assertEquals(now, attachment.updatedAt)
            assertNull(attachment.deletedAt)
            assertEquals(1L, attachment.version)
            assertEquals(contest, attachment.contest)
            assertEquals(member, attachment.member)
            assertEquals("test_file.txt", attachment.filename)
            assertEquals("text/plain", attachment.contentType)
            assertEquals(Attachment.Context.PROBLEM_DESCRIPTION, attachment.context)
        }
    }
}
