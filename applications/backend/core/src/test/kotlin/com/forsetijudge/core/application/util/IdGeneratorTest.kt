package com.forsetijudge.core.application.util

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldMatch

class IdGeneratorTest :
    FunSpec({
        test("getUUIDv7 should return a valid UUIDv7") {
            val uuid = IdGenerator.getUUID()
            uuid.version() shouldBe 7
        }

        test("getTraceId should return a valid 32-character hexadecimal string") {
            val traceId = IdGenerator.getTraceId()
            traceId.length shouldBe 32
            traceId shouldMatch Regex("^[0-9a-f]{32}$")
        }
    })
