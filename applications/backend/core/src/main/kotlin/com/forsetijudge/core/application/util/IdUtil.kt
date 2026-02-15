package com.forsetijudge.core.application.util

import com.github.f4b6a3.uuid.UuidCreator
import java.security.SecureRandom
import java.util.UUID

object IdUtil {
    private val random = SecureRandom()

    /**
     * Generates a UUIDv7, which is a time-ordered UUID that includes a timestamp and random components.
     */
    fun getUUIDv7(): UUID = UuidCreator.getTimeOrderedEpoch()

    /**
     * Generates a valid OpenTelemetry trace ID (32-character hexadecimal string / 128 bits)
     */
    fun getTraceId(): String {
        val bytes = ByteArray(16)
        random.nextBytes(bytes)
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
