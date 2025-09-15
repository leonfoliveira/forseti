package io.github.leonfoliveira.judge.common.domain.model

data class RequestContext(
    var ip: String? = null,
    var traceId: String? = null,
) {
    companion object {
        private val currentThread = ThreadLocal<RequestContext>()

        fun getCurrent(): RequestContext {
            if (currentThread.get() == null) {
                currentThread.set(RequestContext())
            }
            return currentThread.get()
        }

        fun clearContext() {
            currentThread.remove()
        }
    }
}
