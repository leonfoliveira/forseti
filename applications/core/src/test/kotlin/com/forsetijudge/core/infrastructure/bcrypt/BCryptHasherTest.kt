package com.forsetijudge.core.infrastructure.bcrypt

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class BCryptHasherTest {
    private val hasher = BCryptHasher()

    @Test
    fun `hash should return a non-empty string`() {
        val value = "password"
        val hash = hasher.hash(value)
        assertTrue(hash.isNotEmpty())
    }

    @Test
    fun `verify should return true for correct value and hash`() {
        val value = "password"
        val hash = hasher.hash(value)
        assertTrue(hasher.verify(value, hash))
    }

    @Test
    fun `verify should return false for incorrect value and hash`() {
        val value = "password"
        val hash = hasher.hash(value)
        assertFalse(hasher.verify("wrong password", hash))
    }
}
