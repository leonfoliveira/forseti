package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.opentelemetry.api.trace.Span
import org.slf4j.MDC
import java.time.OffsetDateTime
import java.util.UUID

data class ExecutionContext(
    val ip: String? = null,
    val traceId: String,
    var contestId: UUID? = null,
    var session: SessionResponseBodyDTO?,
    val startedAt: OffsetDateTime = OffsetDateTime.now(),
) {
    companion object {
        private var instance: ThreadLocal<ExecutionContext> = ThreadLocal()

        /**
         * Starts a new RequestContext with the given parameters.
         * If a session is provided, it checks if the session's contest ID matches the provided contest ID.
         * If they do not match, an UnauthorizedException is thrown.
         *
         * @param ip The IP address of the requester. This can be null for workers or internal services.
         * @param traceId The trace ID for tracking requests.
         * @param contestId The contest ID associated with the request, if applicable. This can be null for requests that are not related to a specific contest.
         * @param session The session information of the requester. This can be null for unauthenticated requests.
         * @return A new RequestContext instance with the provided parameters and the current timestamp as the start time.
         * @throws UnauthorizedException If the session's contest ID does not match the provided contest ID.
         */
        fun set(
            ip: String? = null,
            traceId: String? = null,
            contestId: UUID? = null,
            session: SessionResponseBodyDTO? = null,
            startedAt: OffsetDateTime = OffsetDateTime.now(),
        ): ExecutionContext {
            val traceId = traceId ?: Span.current().spanContext.traceId ?: IdGenerator.getTraceId()

            val context =
                ExecutionContext(
                    ip = ip,
                    traceId = traceId,
                    contestId = contestId,
                    session = session,
                    startedAt = startedAt,
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
        fun get(): ExecutionContext = instance.get() ?: set()

        /**
         * Clears the current RequestContext from the security context.
         */
        fun clear() {
            instance.remove()
        }

        fun getStartAt(): OffsetDateTime = get().startedAt

        fun setSession(session: Session?) {
            instance.get().session = session?.toResponseBodyDTO()
        }

        fun getSession(): SessionResponseBodyDTO = get().session ?: throw UnauthorizedException("Not authenticated")

        fun getContestId(): UUID = get().contestId ?: throw UnauthorizedException("Contest ID is not available in the current context")

        fun getContestIdNullable(): UUID? = get().contestId

        fun getMemberId(): UUID = get().session?.member?.id ?: throw UnauthorizedException("Not authenticated")

        fun getMemberIdNullable(): UUID? = get().session?.member?.id

        fun getMember(): MemberResponseBodyDTO = get().session?.member ?: throw UnauthorizedException("Not authenticated")
    }
}
