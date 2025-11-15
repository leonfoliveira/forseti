package io.github.leonfoliveira.forseti.api.application.util

class ApiMetrics {
    companion object {
        // Time to upload an attachment
        const val API_ATTACHMENT_UPLOAD_TIME = "api_attachment_upload_time"

        // Time to download an attachment
        const val API_ATTACHMENT_DOWNLOAD_TIME = "api_attachment_download_time"
    }

    private constructor() {}
}
