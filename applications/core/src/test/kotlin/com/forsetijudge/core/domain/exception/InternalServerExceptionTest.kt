package com.forsetijudge.core.domain.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class InternalServerExceptionTest {
    @Test
    fun `should create a InternalServerException`() {
        val message = "This is a InternalServerException"
        val exception = InternalServerException(message)

        assertEquals(message, exception.message)
    }
}
