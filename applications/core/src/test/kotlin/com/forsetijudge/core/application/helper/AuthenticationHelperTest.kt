package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import java.util.UUID
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder

class AuthenticationHelperTest {
    @BeforeEach
    fun clearContext() {
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun cleanupContext() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `returns session and member id for session authentication`() {
        val member = MockEntityFactory.member(id = UUID.randomUUID())
        val sessionMember =
            MockModelFactory.sessionMember(
                id = member.id,
                type = member.type,
                name = member.name,
            )
        val session = MockModelFactory.session(member = sessionMember)
        SecurityContextHolder.getContext().authentication = SessionAuthentication(session, "127.0.0.1")

        assertSame(session, AuthenticationHelper.getCurrentSession())
        assertSame(session, AuthenticationHelper.getCurrentSessionNullable())
        assertEquals(member.id, AuthenticationHelper.getCurrentMemberId())
        assertEquals(member.id, AuthenticationHelper.getCurrentMemberIdNullable())
    }

    @Test
    fun `throws for missing session and returns null from nullable accessors`() {
        assertThrows(UnauthorizedException::class.java) { AuthenticationHelper.getCurrentSession() }
        assertThrows(UnauthorizedException::class.java) { AuthenticationHelper.getCurrentMemberId() }
        assertNull(AuthenticationHelper.getCurrentSessionNullable())
        assertNull(AuthenticationHelper.getCurrentMemberIdNullable())
    }

    @Test
    fun `treats a different authentication type as unauthenticated`() {
        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken("user", "password")

        assertThrows(UnauthorizedException::class.java) { AuthenticationHelper.getCurrentSession() }
        assertNull(AuthenticationHelper.getCurrentSessionNullable())
    }
}
