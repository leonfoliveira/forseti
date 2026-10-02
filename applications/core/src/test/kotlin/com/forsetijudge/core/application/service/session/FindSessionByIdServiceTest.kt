package com.forsetijudge.core.application.service.session

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.output.cache.SessionCache
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class FindSessionByIdServiceTest {
    private val cache = mock<SessionCache>()
    private val service = FindSessionByIdService(cache)

    @Test
    fun `returns an unexpired session`() {
        val session = MockModelFactory.session(expiresAt = OffsetDateTime.now().plusMinutes(5))
        whenever(cache.get(session.id)).thenReturn(session)

        assertSame(session, service.execute(FindSessionByIdUseCase.Command(session.id)))
        verify(cache, never()).evict(session)
    }

    @Test
    fun `rejects and evicts an expired session`() {
        val session = MockModelFactory.session(expiresAt = OffsetDateTime.now().minusSeconds(1))
        whenever(cache.get(session.id)).thenReturn(session)

        assertThrows(UnauthorizedException::class.java) {
            service.execute(FindSessionByIdUseCase.Command(session.id))
        }
        verify(cache).evict(session)
    }

    @Test
    fun `rejects a missing session`() {
        val command = FindSessionByIdUseCase.Command(java.util.UUID.randomUUID())
        whenever(cache.get(command.sessionId)).thenReturn(null)

        assertThrows(UnauthorizedException::class.java) { service.execute(command) }
    }
}
