package com.forsetijudge.core.domain.entity

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import java.time.OffsetDateTime

class ContestTest :
    FunSpec({
        val pastDate = OffsetDateTime.now().minusHours(1)
        val futureDate = OffsetDateTime.now().plusHours(1)

        listOf(
            Pair(pastDate, true),
            Pair(futureDate, false),
        ).forEach { (startAt, expected) ->
            test("hasStarted with startAt = $startAt should return $expected") {
                val contest = ContestMockBuilder.build(startAt = startAt)

                contest.hasStarted() shouldBe expected
            }
        }

        listOf(
            Pair(pastDate, true),
            Pair(futureDate, false),
        ).forEach { (endAt, expected) ->
            test("hasFinished with endAt = $endAt should return $expected") {
                val contest = ContestMockBuilder.build(endAt = endAt)

                contest.hasFinished() shouldBe expected
            }
        }

        listOf(
            Triple(pastDate, pastDate, false),
            Triple(pastDate, futureDate, true),
            Triple(futureDate, futureDate, false),
        ).forEach { (startAt, endAt, expected) ->
            test("isActive with startAt = $startAt and endAt = $endAt should return $expected") {
                val contest = ContestMockBuilder.build(startAt = startAt, endAt = endAt)

                contest.isActive() shouldBe expected
            }
        }

        listOf(
            Pair(ContestMockBuilder.build(), false),
            Pair(ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusHours(1)), true),
            Pair(ContestMockBuilder.build(frozenAt = OffsetDateTime.now().plusHours(1)), false),
        ).forEach { (contest, expected) ->
            test("isFrozen with frozenAt = ${contest.frozenAt} should return $expected") {
                contest.isFrozen shouldBe expected
            }
        }
    })
