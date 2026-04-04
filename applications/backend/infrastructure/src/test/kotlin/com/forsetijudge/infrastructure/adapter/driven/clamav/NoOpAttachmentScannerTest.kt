package com.forsetijudge.infrastructure.adapter.driven.clamav

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class NoOpAttachmentScannerTest :
    FunSpec({
        val sut = NoOpAttachmentScanner()

        test("should return true for any input") {
            val result = sut.isSecure("any input".toByteArray())
            result shouldBe true
        }
    })
