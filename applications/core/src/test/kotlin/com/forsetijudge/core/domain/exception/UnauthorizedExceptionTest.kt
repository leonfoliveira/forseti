package com.forsetijudge.core.domain.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class UnauthorizedExceptionTest {
    @Test
    fun `should create a UnauthorizedException`() {
        val message = "This is a UnauthorizedException"
        val exception = UnauthorizedException(message)

        assertEquals(message, exception.message)
    }

    @Test
    fun `should create a UnauthorizedException with default message`() {
        val exception = UnauthorizedException()

        assertEquals("Unauthorized", exception.message)
    }
}
