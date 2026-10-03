package com.forsetijudge.core.domain.entity.aud

import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.factory.MockModelFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.slf4j.MDC
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class SessionRevisionListenerTest {
    private val listener = SessionRevisionListener()

    @AfterEach
    fun clearContext() {
        SecurityContextHolder.clearContext()
        MDC.clear()
    }

    @Test
    fun `populates revision metadata from current session authentication and trace`() {
        val session = MockModelFactory.session()
        val authentication = SessionAuthentication(session, "203.0.113.7")
        SecurityContextHolder.getContext().authentication = authentication
        MDC.put("traceId", "trace-123")
        val revision = SessionRevisionEntity()

        listener.newRevision(revision)

        assertEquals(session.member.id, revision.memberId)
        assertEquals("203.0.113.7", revision.ip)
        assertEquals("trace-123", revision.traceId)
    }

    @Test
    fun `leaves session metadata unset when no authentication or trace exists`() {
        val revision = SessionRevisionEntity()

        listener.newRevision(revision)

        assertNull(revision.memberId)
        assertNull(revision.ip)
        assertNull(revision.traceId)
    }

    @Test
    fun `ignores non-session authentication but retains trace`() {
        val authentication =
            org.springframework.security.authentication.UsernamePasswordAuthenticationToken.authenticated(
                UUID.randomUUID(),
                "credentials",
                emptyList(),
            )
        SecurityContextHolder.getContext().authentication = authentication
        MDC.put("traceId", "trace-non-session")
        val revision = SessionRevisionEntity()

        listener.newRevision(revision)

        assertNull(revision.memberId)
        assertNull(revision.ip)
        assertEquals("trace-non-session", revision.traceId)
    }

    @Test
    fun `rejects a revision entity of the wrong type`() {
        org.junit.jupiter.api.Assertions.assertThrows(ClassCastException::class.java) {
            listener.newRevision(Any())
        }
    }
}
