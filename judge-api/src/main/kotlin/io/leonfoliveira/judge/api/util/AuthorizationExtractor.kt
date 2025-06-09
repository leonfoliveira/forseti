package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.api.security.JwtAuthentication
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.JwtAdapter
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class AuthorizationExtractor(
    private val jwtAdapter: JwtAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun extractMember(authHeader: String?): AuthorizationMember? {
        logger.info("Started extracting AuthorizationMember from auth header")

        val token = authHeader?.replace("Bearer ", "")

        if (authHeader == null || token == null || !authHeader.startsWith("Bearer ")) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("No JWT token found in auth header")
            return null
        }

        try {
            val authorizationMember = jwtAdapter.decodeToken(token)
            logger.info("Finished extracting AuthorizationMember: $authorizationMember")
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorizationMember)
            return authorizationMember
        } catch (ex: Exception) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("Could not decode JWT token")
        }

        return null
    }
}
