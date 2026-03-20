package com.forsetijudge.infrastructure.adapter.driven.clamav

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import xyz.capybara.clamav.ClamavClient
import xyz.capybara.clamav.commands.scan.result.ScanResult
import java.io.InputStream

class ClamAVAttachmentScannerTest :
    FunSpec({
        val client = mockk<ClamavClient>()

        val sut = ClamAVAttachmentScanner(client)

        beforeEach {
            clearAllMocks()
        }

        test("should return true when no virus is found") {
            val bytes = "clean file".toByteArray()
            every { client.scan(any<InputStream>()) } returns ScanResult.OK

            val result = sut.isSecure(bytes)

            result shouldBe true
        }

        test("should return false when a virus is found") {
            val bytes = "infected file".toByteArray()
            every { client.scan(any<InputStream>()) } returns ScanResult.VirusFound(mapOf())

            val result = sut.isSecure(bytes)

            result shouldBe false
        }
    })
