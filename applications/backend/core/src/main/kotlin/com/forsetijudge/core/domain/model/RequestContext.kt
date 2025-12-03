package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Session

/**
 * Singleton to hold request context information such as IP, trace ID, and session details.
 *
 * @property ip The IP address of the requester. This will be null for workers or internal services.
 * @property traceId The trace ID for tracking requests.
 * @property session The session information of the requester. This will be null for unauthenticated requests.
 */
data class RequestContext(
    var ip: String? = null,
    var traceId: String? = null,
    var session: Session? = null,
) {
    companion object {
        private val currentThread = ThreadLocal<RequestContext>()

        fun getContext(): RequestContext {
            if (currentThread.get() == null) {
                currentThread.set(RequestContext())
            }
            return currentThread.get()
        }

        fun setContext(context: RequestContext) {
            currentThread.set(context)
        }

        fun clearContext() {
            currentThread.remove()
        }
    }
}
