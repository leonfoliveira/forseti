package com.forsetijudge.core.util

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.dto.response.member.MemberWithContestAndLoginResponseDTO
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import io.opentelemetry.api.trace.Span
import java.util.UUID
import org.slf4j.MDC

data class ExecutionContext(
    var ip: String? = null,
    var traceId: String,
    var session: SessionResponseBodyDTO? = null,
) {
    companion object {
        private var instance = ThreadLocal<ExecutionContext>()

        /**
         * Starts a new RequestContext with the given parameters.
         *
         * @param ip The IP address of the requester. This can be null for workers or internal services.
         * @param traceId The trace ID for tracking requests.
         * @return A new RequestContext instance with the provided parameters and the current timestamp as the start time.
         */
        fun start(
            ip: String? = null,
            traceId: String? = null,
            session: SessionResponseBodyDTO? = null,
        ): ExecutionContext {
            val traceId =
                traceId ?: Span
                    .current()
                    .spanContext.traceId ?: IdGenerator.getTraceId()

            val context =
                ExecutionContext(
                    ip = ip,
                    traceId = traceId,
                    session = session,
                )

            instance.set(context)

            val currentSpan = Span.current()
            currentSpan.setAttribute("trace_id", traceId)
            MDC.put("trace_id", traceId)

            return context
        }

        /**
         * Retrieves the current RequestContext from the security context.
         * If no RequestContext is found, it creates and returns a new one with default values.
         *
         * @return The current RequestContext.
         */
        fun get(): ExecutionContext = instance.get() ?: start()

        /**
         * Sets the given RequestContext as the current context in the security context.
         *
         * @param executionContext The RequestContext to set as the current context.
         */
        fun set(executionContext: ExecutionContext) {
            instance.set(executionContext)
        }

        /**
         * Sets the session attribute
         *
         * @param session The session to set
         */
        fun setSession(session: SessionResponseBodyDTO) {
            get().session = session
        }

        /**
         * Clears the current RequestContext from the security context.
         */
        fun clear() {
            instance.remove()
        }

        fun getSession(): SessionResponseBodyDTO = get().session ?: throw UnauthorizedException("Not authenticated")

        fun getMemberId(): UUID = get().session?.member?.id ?: throw UnauthorizedException("Not authenticated")

        fun getMemberIdNullable(): UUID? = get().session?.member?.id

        fun getMember(): MemberWithContestAndLoginResponseDTO = get().session?.member ?: throw UnauthorizedException("Not authenticated")

        fun getMemberNullable(): MemberWithContestAndLoginResponseDTO? = get().session?.member
    }
}
