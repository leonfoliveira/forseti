package io.github.leonfoliveira.judge.common.domain.model

import io.github.leonfoliveira.judge.common.domain.entity.Session

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
