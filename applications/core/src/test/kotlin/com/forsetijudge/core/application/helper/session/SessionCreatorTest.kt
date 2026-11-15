package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.util.IdGenerator
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mockStatic
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class SessionCreatorTest {
    private val sessionDeleter = mock<SessionDeleter>()
    private val sessionCache = mock<SessionCache>()
    private val defaultExpirationSeconds = 900L
    private val rootExpirationSeconds = 3600L
    private val sessionCreator =
        SessionCreator(sessionDeleter, sessionCache, defaultExpirationSeconds, rootExpirationSeconds)

    private val now = OffsetDateTime.now()

    @Test
    fun `should create a session for a root member`() {
        val member = MockEntityFactory.member(type = Member.Type.ROOT)
        val contestId = IdGenerator.getUUID()

        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val session = sessionCreator.create(contestId, member)

            assertEquals(contestId, session.contestId)
            assertEquals(member.id, session.member.id)
            assertEquals(member.type, session.member.type)
            assertEquals(member.name, session.member.name)
            assertEquals(now.plusSeconds(rootExpirationSeconds), session.expiresAt)
            verify(sessionDeleter).deleteByMember(member)
            verify(sessionCache).cache(session)
        }
    }

    @Test
    fun `should create a session for a non-root member`() {
        val member = MockEntityFactory.member(type = Member.Type.CONTESTANT)
        val contestId = IdGenerator.getUUID()

        mockStatic(OffsetDateTime::class.java).use { mockedStatic ->
            mockedStatic.whenever(OffsetDateTime::now).thenReturn(now)

            val session = sessionCreator.create(contestId, member)

            assertEquals(contestId, session.contestId)
            assertEquals(member.id, session.member.id)
            assertEquals(member.type, session.member.type)
            assertEquals(member.name, session.member.name)
            assertEquals(now.plusSeconds(defaultExpirationSeconds), session.expiresAt)
            verify(sessionDeleter).deleteByMember(member)
            verify(sessionCache).cache(session)
        }
    }
}
