package com.forsetijudge.core.domain.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ForbiddenExceptionTest {
    @Test
    fun `should create a ConflictException`() {
        val message = "This is a ForbiddenException"
        val exception = ForbiddenException(message)

        assertEquals(message, exception.message)
    }

    @Test
    fun `should create a ForbiddenException with default message`() {
        val exception = ForbiddenException()

        assertEquals("Forbidden", exception.message)
    }
}
