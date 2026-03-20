package com.forsetijudge.infrastructure.adapter.driven.clamav

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.bucket.AttachmentScanner
import org.springframework.stereotype.Component
import xyz.capybara.clamav.ClamavClient
import xyz.capybara.clamav.commands.scan.result.ScanResult

@Component
class ClamAVAttachmentScanner(
    private val client: ClamavClient,
) : AttachmentScanner {
    private val logger = SafeLogger(this::class)

    override fun isSecure(bytes: ByteArray): Boolean {
        logger.info("Scanning attachment of size ${bytes.size} bytes")
        val result = client.scan(bytes.inputStream())

        return when (result) {
            is ScanResult.OK -> {
                logger.info("No threats found")
                true
            }
            is ScanResult.VirusFound -> {
                logger.warn("Virus found: ${result.foundViruses}")
                false
            }
        }
    }
}
