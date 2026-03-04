package com.forsetijudge.core.port.driven.file

interface FileAnalyser {
    fun getMimeType(bytes: ByteArray): String
}
