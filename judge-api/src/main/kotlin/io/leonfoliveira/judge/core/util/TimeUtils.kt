package io.leonfoliveira.judge.core.util

import java.time.LocalDateTime
import java.time.ZoneId

object TimeUtils {
    fun now(): LocalDateTime = LocalDateTime.now(ZoneId.of("UTC"))
}
