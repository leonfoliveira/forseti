package io.github.leonfoliveira.judge.api.middleware.http

import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
class HttpRequestContextFilter : OncePerRequestFilter() {
    public override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val ip =
            request.getHeader("X-Forwarded-For")
                ?: request.remoteAddr
                ?: "unknown"
        val traceId =
            request.getHeader("X-Trace-Id")
                ?: UUID.randomUUID().toString()

        RequestContext.Companion.getCurrent().ip = ip
        RequestContext.Companion.getCurrent().traceId = traceId

        MDC.put("traceId", traceId)

        return filterChain.doFilter(request, response)
    }
}
