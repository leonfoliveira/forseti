package com.forsetijudge.core.domain.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NotFoundExceptionTest {
    @Test
    fun `should create a NotFoundException`() {
        val message = "This is a NotFoundException"
        val exception = NotFoundException(message)

        assertEquals(message, exception.message)
    }

    @Test
    fun `should create a NotFoundException with default message`() {
        val exception = NotFoundException()

        assertEquals("NotFound", exception.message)
    }
}
