package com.forsetijudge.core.util

import com.github.f4b6a3.uuid.UuidCreator
import java.security.SecureRandom
import java.util.UUID

object IdGenerator {
    private val random = SecureRandom()

    /**
     * Generates a UUIDv7, which is a time-ordered UUID that includes a timestamp and random components.
     */
    fun getUUID(): UUID = UuidCreator.getTimeOrderedEpoch()
}
