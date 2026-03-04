package com.forsetijudge.infrastructure.adapter.driven.file

import com.forsetijudge.core.port.driven.file.FileAnalyser
import org.apache.tika.Tika
import org.springframework.stereotype.Component

@Component
class TikaFileAnalyser : FileAnalyser {
    private val tika = Tika()

    override fun getMimeType(bytes: ByteArray): String = tika.detect(bytes)
}
