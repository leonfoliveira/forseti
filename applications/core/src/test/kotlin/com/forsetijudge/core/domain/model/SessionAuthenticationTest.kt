package com.forsetijudge.core.domain.model

import com.forsetijudge.core.factory.MockModelFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.security.core.authority.SimpleGrantedAuthority

class SessionAuthenticationTest {
    @Test
    fun `should create SessionAuthentication with correct authorities`() {
        val session = MockModelFactory.session()
        val ip = "192.0.0.1"

        val sessionAuthentication = SessionAuthentication(session, ip)

        assertEquals(session, sessionAuthentication.session)
        assertEquals(ip, sessionAuthentication.ip)
        assertEquals(
            Entitlement.forType(session.member.type).map { SimpleGrantedAuthority(it.name) },
            sessionAuthentication.authorities,
        )
        assertNull(sessionAuthentication.credentials)
        assertNull(sessionAuthentication.details)
        assertEquals(session.member.id, sessionAuthentication.principal)
        assertTrue(sessionAuthentication.isAuthenticated)
        assertThrows(UnsupportedOperationException::class.java) {
            sessionAuthentication.setAuthenticated(false)
        }
        assertEquals(session.member.name, sessionAuthentication.name)
    }
}
