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
            Triple(pastDate, futureDate, futureDate),
            Triple(futureDate, pastDate, futureDate),
            Triple(null, pastDate, pastDate),
            Triple(pastDate, null, pastDate),
            Triple(null, null, null),
        ).forEach { (autoFreezeAt, manualFreezeAt, expected) ->
            test("freezeAt with autoFreezeAt = $autoFreezeAt and manualFreezeAt = $manualFreezeAt should return $expected") {
                val contest =
                    ContestMockBuilder.build(
                        autoFreezeAt = autoFreezeAt,
                        manualFreezeAt = manualFreezeAt,
                    )

                contest.freezeAt() shouldBe expected
            }
        }

        listOf(
            Triple(null, null, false),
            Triple(futureDate, null, false),
            Triple(pastDate, null, true),
            Triple(pastDate, futureDate, true),
            Triple(pastDate, pastDate, false),
        ).forEach { (freezeAt, unfreezeAt, expected) ->
            test("isFrozen with freezeAt = $freezeAt and unfreezeAt = $unfreezeAt should return $expected") {
                val contest =
                    ContestMockBuilder.build(
                        autoFreezeAt = freezeAt,
                        manualFreezeAt = null,
                        unfreezeAt = unfreezeAt,
                    )

                contest.isFrozen() shouldBe expected
            }
        }
    })
