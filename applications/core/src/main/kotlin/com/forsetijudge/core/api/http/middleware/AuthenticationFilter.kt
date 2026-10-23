package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.input.usecase.contest.FindContestByIdUseCase
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.util.SafeLogger
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import java.util.UUID
import java.util.regex.Pattern
import org.apache.commons.net.util.SubnetUtils
import org.springframework.http.HttpHeaders
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.WebUtils

/**
 * Reads the "session_id" cookie from the incoming request, resolves the associated session and,
 * when valid, populates both the Spring Security context.
 *
 * Requests without a session cookie, or with an invalid/expired one, are simply left
 * unauthenticated instead of failing, so that authorization (permitAll / authenticated) rules
 * declared in HttpConfig can decide how to handle them.
 */
@Component
class AuthenticationFilter(
    private val findContestBySlugUseCase: FindContestBySlugUseCase,
    private val findContestByIdUseCase: FindContestByIdUseCase,
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) : OncePerRequestFilter() {
    val safeLogger = SafeLogger(this::class)

    companion object {
        private val CONTEST_SLUG_PATTERN = Pattern.compile("^/v1/contests/slug/([^/]+).*$")
        private val CONTEST_ID_PATTERN = Pattern.compile("^/v1/contests/([^/]+).*$")
    }

    @Transactional(readOnly = true)
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        safeLogger.info("Starting authentication filter for request: ${request.method} ${request.requestURI}")

        try {
            val sessionId = WebUtils.getCookie(request, SessionCookieBuilder.SESSION_COOKIE_NAME)?.value
            val ip = request.getHeader("X-Forwarded-For") ?: request.remoteAddr

            if (sessionId != null) {
                safeLogger.info("Found session cookie with ID: $sessionId, attempting to resolve session.")

                val sessionUuid =
                    try {
                        UUID.fromString(sessionId)
                    } catch (_: IllegalArgumentException) {
                        throw UnauthorizedException("Invalid session ID format: $sessionId")
                    }
                val session = findSessionByIdUseCase.execute(FindSessionByIdUseCase.Command(sessionId = sessionUuid))

                if (session.member.type != Member.Type.ROOT) {
                    val contest = extractContest(request)
                    logger.info("Extracted contest from request: ${contest?.id ?: "No contest found"}")
                    if (contest != null) {
                        authorizeIp(contest, ip)
                    }
                } else {
                    logger.info("Session belongs to ROOT member, skipping IP authorization.")
                }

                val authentication =
                    SessionAuthentication(
                        session = session,
                        ip = ip,
                    )

                SecurityContextHolder.createEmptyContext()
                SecurityContextHolder.getContext().authentication = authentication
            } else {
                safeLogger.info("No session cookie found, proceeding without authentication.")

                val contest = extractContest(request)
                logger.info("Extracted contest from request: ${contest?.id ?: "No contest found"}")
                if (contest != null) {
                    authorizeIp(contest, ip)
                }
            }

            filterChain.doFilter(request, response)
        } catch (ex: UnauthorizedException) {
            safeLogger.info("Unauthorized access attempt: ${ex.message}. Clearing security context and sending clean cookies.")
            clearSessionCookie(response)
            throw ex
        } catch (ex: Exception) {
            safeLogger.error("Error during authentication filter processing: ${ex.message}", ex)
            throw ex
        } finally {
            SecurityContextHolder.clearContext()
        }
    }

    /**
     * Extracts the contest from the request URI, if present.
     *
     * @param request The HTTP request from which to extract the contest.
     * @return The contest associated with the request, or null if no contest is found.
     * @throws NotFoundException if the contest ID format is invalid.
     */
    private fun extractContest(request: HttpServletRequest): ContestResponseDTO? {
        val slugMatcher = CONTEST_SLUG_PATTERN.matcher(request.requestURI)
        if (slugMatcher.matches()) {
            val slug = slugMatcher.group(1)
            return findContestBySlugUseCase.execute(
                FindContestBySlugUseCase.Command(slug = slug),
            )
        }

        val idMatcher = CONTEST_ID_PATTERN.matcher(request.requestURI)
        if (idMatcher.matches()) {
            val idStr = idMatcher.group(1)
            val id =
                try {
                    UUID.fromString(idStr)
                } catch (_: IllegalArgumentException) {
                    throw NotFoundException("Invalid contest ID format: $idStr")
                }
            return findContestByIdUseCase.execute(
                FindContestByIdUseCase.Command(id = id),
            )
        }

        return null
    }

    /**
     * Authorizes the request based on the IP address and contest ID in the URL.
     * If the request is for a contest, it checks if the IP is within the allowed CIDRs for that contest.
     *
     * @param contest The contest associated with the request.
     * @param ip The IP address of the client making the request.
     * @throws NotFoundException if the contest is not found or if the IP is not authorized for the contest.
     */
    private fun authorizeIp(
        contest: ContestResponseDTO,
        ip: String,
    ) {
        if (contest.ipCIDRs.isEmpty()) {
            logger.info("No IP restrictions for contest ID ${contest.id}, allowing access from IP $ip.")
            return
        }

        if (contest.ipCIDRs.none { cidr ->
                SubnetUtils(cidr)
                    .apply { isInclusiveHostCount = true }
                    .info
                    .isInRange(ip)
            }
        ) {
            logger.info("Unauthorized IP access attempt: IP $ip is not allowed for contest ID ${contest.id}.")
            throw ForbiddenException("Could not find contest with ID: ${contest.id}")
        }
    }

    /**
     * Clears the session and CSRF cookies in the response.
     *
     * @param response The HTTP response to which the cookies will be added.
     */
    private fun clearSessionCookie(response: HttpServletResponse) {
        val sessionCookie = sessionCookieBuilder.buildCleanCookie()
        val csrfCookie = csrfCookieBuilder.buildCleanCookie()
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie)
        response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie)
    }
}
