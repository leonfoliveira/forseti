package com.forsetijudge.core.util

import java.util.UUID
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid

object IdGenerator {
    /**
     * Generates a UUIDv7, which is a time-ordered UUID that includes a timestamp and random components.
     */
    @OptIn(ExperimentalUuidApi::class)
    fun getUUID(): UUID = Uuid.generateV7().toJavaUuid()
}
