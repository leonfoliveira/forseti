package io.github.leonfoliveira.judge.api.util

class ApiMetrics {
    companion object {
        const val API_ATTACHMENT_UPLOAD_TIME = "api_attachment_upload_time"
        const val API_ATTACHMENT_DOWNLOAD_TIME = "api_attachment_download_time"
        const val API_CACHE_HIT_RATE = "api_rate_limit_hit_rate"
        const val API_CACHE_EVICTIONS = "api_rate_limit_evictions"
    }

    private constructor() {}

    class Label {
        companion object {
            const val CACHE_NAME = "name"
        }
    }
}
