package com.forsetijudge.core.api.util

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class CookieBuilderTest {
    @Test
    fun `builds secure cookie with domain and strict transport settings`() {
        val cookie =
            CookieBuilder(cookieDomain = "example.test", cookieSecure = true)
                .from("auth", "secret")
                .build()

        assertEquals("auth", cookie.name)
        assertEquals("secret", cookie.value)
        assertEquals("example.test", cookie.domain)
        assertEquals("/", cookie.path)
        assertTrue(cookie.isHttpOnly)
        assertTrue(cookie.isSecure)
        assertEquals("None", cookie.sameSite)
    }

    @Test
    fun `builds insecure cookie without domain or secure flag`() {
        val cookie =
            CookieBuilder(cookieDomain = "ignored.test", cookieSecure = false)
                .from("auth", "secret")
                .build()

        assertEquals("auth", cookie.name)
        assertEquals("secret", cookie.value)
        assertEquals(null, cookie.domain)
        assertEquals("/", cookie.path)
        assertTrue(cookie.isHttpOnly)
        assertFalse(cookie.isSecure)
        assertEquals("Lax", cookie.sameSite)
    }

    @Test
    fun `creates clean cookies with zero max age`() {
        val secure =
            CookieBuilder(cookieDomain = "example.test", cookieSecure = true)
                .clean("auth")
                .build()
        val insecure =
            CookieBuilder(cookieDomain = "ignored.test", cookieSecure = false)
                .clean("auth")
                .build()

        assertEquals("", secure.value)
        assertEquals(0, secure.maxAge.seconds)
        assertEquals("example.test", secure.domain)
        assertTrue(secure.isSecure)
        assertEquals("None", secure.sameSite)
        assertEquals("", insecure.value)
        assertEquals(0, insecure.maxAge.seconds)
        assertEquals(null, insecure.domain)
        assertFalse(insecure.isSecure)
        assertEquals("Lax", insecure.sameSite)
    }
}
