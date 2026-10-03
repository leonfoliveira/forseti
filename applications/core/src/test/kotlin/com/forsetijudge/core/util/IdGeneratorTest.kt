package com.forsetijudge.core.util

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant

class IdGeneratorTest {
    @Test
    fun `generates unique time ordered UUID version 7 identifiers`() {
        val lowerBound = Instant.now().minusSeconds(1).toEpochMilli()

        val first = IdGenerator.getUUID()
        val second = IdGenerator.getUUID()

        assertEquals(7, first.version())
        assertEquals(7, second.version())
        assertEquals(2, first.variant())
        assertEquals(2, second.variant())
        assertNotEquals(first, second)
        assertTrue(timestamp(first) >= lowerBound)
        assertTrue(timestamp(second) >= timestamp(first))
    }

    private fun timestamp(uuid: java.util.UUID): Long = (uuid.mostSignificantBits ushr 16) and 0xFFFFFFFFFFFF
}
