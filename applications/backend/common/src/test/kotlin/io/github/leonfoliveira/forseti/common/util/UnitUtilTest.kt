package io.github.leonfoliveira.forseti.common.util

import io.github.leonfoliveira.forseti.common.domain.exception.BusinessException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class UnitUtilTest :
    FunSpec({
        context("parseTimeValue") {
            test("should throw BusinessException for invalid format") {
                val exception =
                    shouldThrow<BusinessException> {
                        UnitUtil.parseTimeValue("invalid")
                    }
                exception.message shouldBe "Invalid unit format: invalid"
            }

            test("should throw BusinessException for unknown unit") {
                val exception =
                    shouldThrow<BusinessException> {
                        UnitUtil.parseTimeValue("10xy")
                    }
                exception.message shouldBe "Unknown unit: xy"
            }

            mapOf(
                "" to 1L,
                "ms" to 1L,
                "s" to 1_000L,
                "m" to 60_000L,
                "h" to 3_600_000L,
                "d" to 86_400_000L,
            ).entries.forEach { (unit, expected) ->
                test("should parse \"2$unit\" correctly") {
                    UnitUtil.parseTimeValue("2$unit") shouldBe 2 * expected
                }
            }
        }
    })
