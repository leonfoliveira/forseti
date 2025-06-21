package io.github.leonfoliveira.judge.api.util

enum class ApiMetrics {
    API_ATTACHMENT_UPLOAD_TIME,
    API_ATTACHMENT_DOWNLOAD_TIME;

    override fun toString(): String {
        return name.lowercase()
    }
}