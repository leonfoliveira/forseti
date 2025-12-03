package com.forsetijudge.api.adapter.driving.controller

import com.forsetijudge.api.adapter.dto.response.ErrorResponseDTO
import com.forsetijudge.api.adapter.dto.response.session.SessionResponseDTO
import com.forsetijudge.api.adapter.dto.response.session.toResponseDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.session.DeleteSessionUseCase
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class SessionController(
    val deleteSessionUseCase: DeleteSessionUseCase,
    val sessionCookieBuilder: SessionCookieBuilder,
    val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/sessions/me")
    @Private
    @Operation(
        summary = "Get current session",
        description = "Returns the session of the current user.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Session retrieved successfully",
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun getSession(): ResponseEntity<SessionResponseDTO> {
        logger.info("[GET] /v1/sessions/me")
        val session = RequestContext.getContext().session!!
        return ResponseEntity.ok(session.toResponseDTO())
    }

    @DeleteMapping("/sessions/me")
    @Operation(
        summary = "Delete current session",
        description = "Deletes the session of the current user, effectively logging them out.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "204",
                description = "Session deleted successfully",
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun deleteSession(): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/sessions/me")
        deleteSessionUseCase.deleteCurrent()

        val sessionCookie = sessionCookieBuilder.buildCleanCookie()
        val csrfCookie = csrfCookieBuilder.buildCleanCookie()

        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie).build()
    }
}
