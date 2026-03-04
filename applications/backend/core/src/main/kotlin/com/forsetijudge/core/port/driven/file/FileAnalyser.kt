package com.forsetijudge.core.port.driven.file

interface FileAnalyser {
    /**
     * Get the MIME type of the file based on its content.
     *
     * @param bytes The byte array of the file content.
     * @param contentType The content type provided by the client.
     * @return If the content type is valid for the given bytes, return the MIME type
     */
    fun validateContentType(
        bytes: ByteArray,
        contentType: String,
    ): Boolean
}
