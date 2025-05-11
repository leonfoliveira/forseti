package io.leonfoliveira.judge.core.util

import java.time.LocalDateTime
import java.time.ZoneOffset

object TimeUtils {
    fun now(): LocalDateTime = LocalDateTime.now(ZoneOffset.UTC)
}
