package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class MemberTest {
    private val now = OffsetDateTime.now()

    @Test
    fun `should create a member with valid parameters`() {
        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val contest = MockEntityFactory.contest()

            val member =
                Member(
                    contest = contest,
                    type = Member.Type.CONTESTANT,
                    name = "John Doe",
                    login = "johndoe",
                    password = "hashed_password",
                    ip = "192.168.0.1",
                )

            assertNotNull(member.id)
            assertEquals(now, member.createdAt)
            assertEquals(now, member.updatedAt)
            assertNull(member.deletedAt)
            assertEquals(1L, member.version)
            assertEquals(contest, member.contest)
            assertEquals(Member.Type.CONTESTANT, member.type)
            assertEquals("John Doe", member.name)
            assertEquals("johndoe", member.login)
            assertEquals("hashed_password", member.password)
            assertEquals("192.168.0.1", member.ip)
        }
    }
}
