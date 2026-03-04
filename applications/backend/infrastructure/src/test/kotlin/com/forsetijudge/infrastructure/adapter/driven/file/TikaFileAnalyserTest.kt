package com.forsetijudge.infrastructure.adapter.driven.file

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class TikaFileAnalyserTest :
    FunSpec({
        val sut = TikaFileAnalyser()

        context("validateContentType") {
            test("should invalidate PNG file with PDF content type") {
                val pngBytes =
                    byteArrayOf(
                        0x89.toByte(),
                        0x50.toByte(),
                        0x4E.toByte(),
                        0x47.toByte(),
                        0x0D.toByte(),
                        0x0A.toByte(),
                        0x1A.toByte(),
                        0x0A.toByte(),
                    )

                val result = sut.validateContentType(pngBytes, "application/pdf")

                result shouldBe false
            }

            test("should validate PDF file with PDF content type") {
                val pdfBytes =
                    byteArrayOf(
                        0x25.toByte(),
                        0x50.toByte(),
                        0x44.toByte(),
                        0x46.toByte(),
                        0x2D.toByte(),
                    )

                val result = sut.validateContentType(pdfBytes, "application/pdf")

                result shouldBe true
            }
        }
    })
