package com.forsetijudge.core.domain.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ConflictExceptionTest {
    @Test
    fun `should create a ConflictException`() {
        val message = "This is a ConflictException"
        val exception = ConflictException(message)

        assertEquals(message, exception.message)
    }

    @Test
    fun `should create a ConflictException with default message`() {
        val exception = ConflictException()

        assertEquals("Conflict", exception.message)
    }
}
