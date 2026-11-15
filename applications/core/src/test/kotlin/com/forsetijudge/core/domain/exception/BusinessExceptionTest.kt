package com.forsetijudge.core.domain.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class BusinessExceptionTest {
    @Test
    fun `should create a BusinessException`() {
        val message = "This is a business exception"
        val exception = BusinessException(message)

        assertEquals(message, exception.message)
    }

    @Test
    fun `should create a BusinessException with default message`() {
        val exception = BusinessException()

        assertEquals("BadRequest", exception.message)
    }
}
