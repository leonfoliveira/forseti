package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.factory.MockModelFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
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

    @Nested
    inner class GetCurrentSession {
        @Test
        fun `should return current session when authenticated`() {
            val session = MockModelFactory.session()
            val authentication = SessionAuthentication(session, "")
            SecurityContextHolder.getContext().authentication = authentication

            val result = AuthenticationHelper.getCurrentSession()

            assertSame(session, result)
        }

        @Test
        fun `should throw UnauthorizedException when not authenticated`() {
            SecurityContextHolder.getContext().authentication = null

            assertThrows(UnauthorizedException::class.java) {
                AuthenticationHelper.getCurrentSession()
            }
        }
    }

    @Nested
    inner class GetCurrentSessionNullable {
        @Test
        fun `should return current session when authenticated`() {
            val session = MockModelFactory.session()
            val authentication = SessionAuthentication(session, "")
            SecurityContextHolder.getContext().authentication = authentication

            val result = AuthenticationHelper.getCurrentSessionNullable()

            assertSame(session, result)
        }

        @Test
        fun `should return null when not authenticated`() {
            SecurityContextHolder.getContext().authentication = null

            val result = AuthenticationHelper.getCurrentSessionNullable()

            assertSame(null, result)
        }
    }

    @Nested
    inner class GetCurrentMemberId {
        @Test
        fun `should return current member id when authenticated`() {
            val session = MockModelFactory.session()
            val authentication = SessionAuthentication(session, "")
            SecurityContextHolder.getContext().authentication = authentication
        }

        @Test
        fun `should throw UnauthorizedException when not authenticated`() {
            SecurityContextHolder.getContext().authentication = null

            assertThrows(UnauthorizedException::class.java) {
                AuthenticationHelper.getCurrentMemberId()
            }
        }
    }

    @Nested
    inner class GetCurrentMemberIdNullable {
        @Test
        fun `should return current member id when authenticated`() {
            val session = MockModelFactory.session()
            val authentication = SessionAuthentication(session, "")
            SecurityContextHolder.getContext().authentication = authentication

            val result = AuthenticationHelper.getCurrentMemberIdNullable()

            assertSame(result, session.member.id)
        }

        @Test
        fun `should return null when not authenticated`() {
            SecurityContextHolder.getContext().authentication = null

            val result = AuthenticationHelper.getCurrentMemberIdNullable()

            assertSame(null, result)
        }
    }
}
