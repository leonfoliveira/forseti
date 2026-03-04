package com.forsetijudge.infrastructure.adapter.driven.file

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.file.FileAnalyser
import org.apache.tika.detect.DefaultDetector
import org.springframework.stereotype.Component

@Component
class TikaFileAnalyser : FileAnalyser {
    private val logger = SafeLogger(this::class)

    override fun validateContentType(
        bytes: ByteArray,
        contentType: String,
    ): Boolean {
        logger.info("Validating content type: $contentType")

        val detector = DefaultDetector()
        val metadata =
            org.apache.tika.metadata
                .Metadata()

        metadata.set(org.apache.tika.metadata.Metadata.CONTENT_TYPE, contentType)

        val detectedType = detector.detect(bytes.inputStream(), metadata).toString()
        val match = detectedType == contentType

        logger.info("Match: $match")
        return match
    }
}
