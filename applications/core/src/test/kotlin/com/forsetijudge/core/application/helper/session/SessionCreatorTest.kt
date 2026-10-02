package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.test.factory.MockEntityFactory
import java.time.OffsetDateTime
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class SessionCreatorTest {
    private val sessionDeleter = mock<SessionDeleter>()
    private val sessionCache = mock<SessionCache>()
    private val creator = SessionCreator(sessionDeleter, sessionCache, 900L, 3600L)

    @Test
    fun `creates default session and evicts previous member session`() {
        val member =
            MockEntityFactory.member(
                id = UUID.randomUUID(),
                type = Member.Type.CONTESTANT,
                name = "Contestant",
            )
        val contestId = UUID.randomUUID()
        val before = OffsetDateTime.now()

        val created = creator.create(contestId, member)

        val after = OffsetDateTime.now()
        assertEquals(contestId, created.contestId)
        assertEquals(member.id, created.member.id)
        assertEquals(member.type, created.member.type)
        assertEquals(member.name, created.member.name)
        assertNotEquals(created.id, created.csrfToken)
        assertTrue(!created.expiresAt.isBefore(before.plusSeconds(900)))
        assertTrue(!created.expiresAt.isAfter(after.plusSeconds(900)))
        verify(sessionDeleter).deleteByMember(member)
        verify(sessionCache).cache(created)
    }

    @Test
    fun `uses extended root expiration and permits contestless sessions`() {
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        val before = OffsetDateTime.now()

        val created = creator.create(null, root)

        assertEquals(null, created.contestId)
        assertTrue(!created.expiresAt.isBefore(before.plusSeconds(3600)))
        verify(sessionCache).cache(created)
    }
}
