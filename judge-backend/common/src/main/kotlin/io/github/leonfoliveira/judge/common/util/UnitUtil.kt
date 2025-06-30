package io.github.leonfoliveira.judge.common.util

import io.github.leonfoliveira.judge.common.domain.exception.BusinessException

object UnitUtil {
    private val cpuMultipliers =
        mapOf(
            "m" to 1_000_000L,
            "" to 1_000_000_000L,
        )

    private val memoryMultipliers =
        mapOf(
            "" to 1L,
            "B" to 1L,
            "K" to 1_000L,
            "M" to 1_000_000L,
            "G" to 1_000_000_000L,
        )

    private val timeMultipliers =
        mapOf(
            "" to 1L,
            "ms" to 1L,
            "s" to 1_000L,
            "m" to 60_000L,
            "h" to 3_600_000L,
            "d" to 86_400_000L,
        )

    fun parseCpuValue(value: String): Long {
        return parseValue(value, cpuMultipliers)
    }

    fun parseMemoryValue(value: String): Long {
        return parseValue(value, memoryMultipliers)
    }

    fun parseTimeValue(value: String): Long {
        return parseValue(value, timeMultipliers)
    }

    private fun parseValue(
        value: String,
        multipliers: Map<String, Long>,
    ): Long {
        val unit = value.takeLastWhile { it.isLetter() }
        val number =
            value.dropLast(unit.length).toDoubleOrNull()
                ?: throw BusinessException("Invalid unit format: $value")
        val multiplier =
            multipliers[unit]
                ?: throw BusinessException("Unknown unit: $unit")
        return (number * multiplier).toLong()
    }
}
