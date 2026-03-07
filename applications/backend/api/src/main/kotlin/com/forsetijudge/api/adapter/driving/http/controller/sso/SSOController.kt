package com.forsetijudge.api.adapter.driving.http.controller.sso

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class SSOController {
    private val logger = SafeLogger(this::class)

    companion object {
        private val GRAFANA_MEMBER_TYPES = setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)
        private const val GRAFANA_USER_HEADER = "x-webauth-user"
        private const val GRAFANA_NAME_HEADER = "x-webauth-name"
    }

    @GetMapping("/sso/grafana")
    fun getGrafanaCredentials(): ResponseEntity<Map<String, Boolean>> {
        logger.info("[GET] /v1/sso/grafana")
        val member = ExecutionContext.getMemberNullable()

        if (member != null && member.type in setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)) {
            val user = if (member.contestSlug != null) "${member.login}@${member.contestSlug}" else member.login
            logger.info("Providing Grafana credentials for user '$user' with name '${member.name}'")
            return ResponseEntity
                .ok()
                .header("x-webauth-user", user)
                .header("x-webauth-name", member.name)
                .body(mapOf("ok" to true))
        }

        logger.info("No Grafana credentials provided for unauthenticated user or user with insufficient permissions")
        /**
         * Although contrary to REST principles, we need to return 200 OK so Traefik continues to forward the request to Grafana,
         * which will then return 401 Unauthorized and show the default login page as fallback.
         * This allows the ROOT member to sign in on Grafana without needing to sign in on a contest dashboard first.
         */
        return ResponseEntity.ok().body(mapOf("ok" to false))
    }
}
