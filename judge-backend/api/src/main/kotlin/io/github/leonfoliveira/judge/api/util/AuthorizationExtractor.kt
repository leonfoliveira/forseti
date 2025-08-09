package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class AuthorizationExtractor(
    private val jwtAdapter: JwtAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun extract(accessToken: String?): Authorization? {
        logger.info("Started extracting Authorization from auth header")

        if (accessToken == null) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("Invalid or missing auth header")
            return null
        }

        if (accessToken.isBlank()) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("No JWT token found in auth header")
            return null
        }

        try {
            val authorization = jwtAdapter.decodeToken(accessToken)
            logger.info("Finished extracting Authorization: $authorization")
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)
            return authorization
        } catch (ex: Exception) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("Could not decode JWT token")
        }

        return null
    }
}
