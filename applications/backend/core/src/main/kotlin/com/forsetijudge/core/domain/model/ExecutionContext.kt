package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.UnauthorizedException
import io.opentelemetry.api.trace.Span
import org.slf4j.MDC
import java.time.OffsetDateTime
import java.util.UUID

data class ExecutionContext(
    var ip: String? = null,
    var traceId: String,
    var contestId: UUID? = null,
    var session: Session? = null,
    var startedAt: OffsetDateTime = OffsetDateTime.now(),
) {
    companion object {
        private var instance: ThreadLocal<ExecutionContext> = ThreadLocal()

        /**
         * Starts a new RequestContext with the given parameters.
         *
         * @param ip The IP address of the requester. This can be null for workers or internal services.
         * @param traceId The trace ID for tracking requests.
         * @param contestId The contest ID associated with the request, if applicable. This can be null for requests that are not related to a specific contest.
         * @return A new RequestContext instance with the provided parameters and the current timestamp as the start time.
         */
        fun start(
            ip: String? = null,
            traceId: String? = null,
            contestId: UUID? = null,
            startedAt: OffsetDateTime = OffsetDateTime.now(),
        ): ExecutionContext {
            val traceId = traceId ?: Span.current().spanContext.traceId ?: IdGenerator.getTraceId()

            val context =
                ExecutionContext(
                    ip = ip,
                    traceId = traceId,
                    contestId = contestId,
                    startedAt = startedAt,
                )

            instance.set(context)

            val currentSpan = Span.current()
            currentSpan.setAttribute("trace_id", traceId)
            MDC.put("trace_id", traceId)

            return context
        }

        /**
         * Update the current ExecutionContext with the session information from the provided Session object.
         *
         * @return The updated ExecutionContext with the session information included.
         * @throw UnauthorizedException if the session's contest ID does not match the current context's contest ID (if the context has a contest ID)
         */
        fun authenticate(session: Session): ExecutionContext {
            val context = get()
            if (context.contestId != null && context.contestId != session.contest?.id) {
                throw UnauthorizedException("Session contest ID does not match the current context's contest ID")
            }
            context.session = session
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
         * Clears the current RequestContext from the security context.
         */
        fun clear() {
            instance.remove()
        }

        fun setSession(session: Session?) {
            instance.get().session = session
        }

        fun getSession(): Session = get().session ?: throw UnauthorizedException("Not authenticated")

        fun getContestId(): UUID = get().contestId ?: throw UnauthorizedException("Contest ID is not available in the current context")

        fun getContestIdNullable(): UUID? = get().contestId

        fun getMemberId(): UUID = get().session?.member?.id ?: throw UnauthorizedException("Not authenticated")

        fun getMemberIdNullable(): UUID? = get().session?.member?.id

        fun getMember(): Member = get().session?.member ?: throw UnauthorizedException("Not authenticated")
    }
}
