package com.forsetijudge.infrastructure.adapter.driven.clamav

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.bucket.AttachmentScanner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(name = ["clamav.enabled"], havingValue = "false")
class NoOpAttachmentScanner : AttachmentScanner {
    private val logger = SafeLogger(this::class)

    override fun isSecure(bytes: ByteArray): Boolean {
        logger.warn("ClamAV is disabled. Skipping attachment scan.")
        return true
    }
}
