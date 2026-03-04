package com.forsetijudge.infrastructure.adapter.driven.file

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class TikaFileAnalyserTest :
    FunSpec({
        val sut = TikaFileAnalyser()

        context("getMimeType") {
            test("should return correct mime type for a PNG file") {
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

                val mimeType = sut.getMimeType(pngBytes)

                mimeType shouldBe "image/png"
            }

            test("should return correct mime type for a PDF file") {
                val pdfBytes =
                    byteArrayOf(
                        0x25.toByte(),
                        0x50.toByte(),
                        0x44.toByte(),
                        0x46.toByte(),
                        0x2D.toByte(),
                    )

                val mimeType = sut.getMimeType(pdfBytes)

                mimeType shouldBe "application/pdf"
            }
        }
    })
