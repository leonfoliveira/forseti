package com.forsetijudge.core.port.driven.bucket

interface AttachmentScanner {
    /**
     * Checks if the given byte array is considered secure or there are any potential security risks associated with it.
     * This method can be used to validate the contents of the byte array before processing it further, ensuring that it does not contain any malicious data.
     *
     * @param bytes The byte array to be checked.
     * @return true if the byte array is secure, false otherwise.
     */
    fun isSecure(bytes: ByteArray): Boolean
}
