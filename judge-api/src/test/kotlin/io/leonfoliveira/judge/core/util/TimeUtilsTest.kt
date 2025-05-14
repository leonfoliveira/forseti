package io.leonfoliveira.judge.core.util

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import java.time.ZoneOffset

class TimeUtilsTest : FunSpec({
    context("now") {
        test("should return the current time in UTC") {
            val now = TimeUtils.now()
            val utcOffset = now.atZone(ZoneOffset.UTC).offset
            utcOffset.id shouldBe ZoneOffset.UTC.id
        }
    }
})
