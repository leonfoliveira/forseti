package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.util.IdGenerator
import java.time.OffsetDateTime
import java.time.ZoneOffset
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.whenever

class SessionTest {
    private val now = OffsetDateTime.of(2024, 6, 1, 12, 0, 0, 0, ZoneOffset.UTC)

    @Test
    fun `should create a session with valid parameters`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member()
        val csrfToken = IdGenerator.getUUID()
        val expiresAt = now.plusHours(1)

        val session =
            Session(
                contestId = contest.id,
                member =
                    Session.Member(
                        id = member.id,
                        type = Member.Type.CONTESTANT,
                        name = "Test User",
                    ),
                csrfToken = csrfToken,
                expiresAt = expiresAt,
            )

        assertEquals(contest.id, session.contestId)
        assertEquals(member.id, session.member.id)
        assertEquals(Member.Type.CONTESTANT, session.member.type)
        assertEquals("Test User", session.member.name)
        assertEquals(csrfToken, session.csrfToken)
        assertEquals(expiresAt, session.expiresAt)
    }

    @ParameterizedTest
    @CsvSource(
        "2023-01-01T00:00:00-03:00, true",
        "2099-01-01T00:00:00-03:00, false",
    )
    fun `should correctly determine if a session is expired`(
        expiresAt: String,
        expected: Boolean,
    ) {
        val parsedExpiresAt = OffsetDateTime.parse(expiresAt)

        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val session =
                Session(
                    member =
                        Session.Member(
                            id = IdGenerator.getUUID(),
                            type = Member.Type.CONTESTANT,
                            name = "Test User",
                        ),
                    expiresAt = parsedExpiresAt,
                )

            assertEquals(expected, session.isExpired())
        }
    }
}
