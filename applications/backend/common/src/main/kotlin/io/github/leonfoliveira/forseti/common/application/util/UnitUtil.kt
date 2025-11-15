package io.github.leonfoliveira.forseti.common.application.util

import io.github.leonfoliveira.forseti.common.application.domain.exception.BusinessException

object UnitUtil {
    private val timeMultipliers =
        mapOf(
            "" to 1L,
            "ms" to 1L,
            "s" to 1_000L,
            "m" to 60_000L,
            "h" to 3_600_000L,
            "d" to 86_400_000L,
        )

    fun parseTimeValue(value: String): Long {
        val unit = value.takeLastWhile { it.isLetter() }
        val number =
            value.dropLast(unit.length).toDoubleOrNull()
                ?: throw BusinessException("Invalid unit format: $value")
        val multiplier =
            timeMultipliers[unit]
                ?: throw BusinessException("Unknown unit: $unit")
        return (number * multiplier).toLong()
    }
}
