package io.github.leonfoliveira.forseti.api.adapter.driving.controller

import io.github.leonfoliveira.forseti.api.adapter.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.SessionResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.Private
import io.github.leonfoliveira.forseti.api.adapter.util.SessionCookieUtil
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.session.DeleteSessionUsecase
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/session")
class SessionController(
    val deleteSessionUseCase: DeleteSessionUsecase,
    val sessionCookieUtil: SessionCookieUtil,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/me")
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
        logger.info("[GET] /v1/session/me")
        val session = RequestContext.getContext().session!!
        return ResponseEntity.ok(session.toResponseDTO())
    }

    @DeleteMapping("/me")
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
        logger.info("[DELETE] /v1/session/me")
        deleteSessionUseCase.deleteCurrent()
        val cookie = sessionCookieUtil.buildClearCookie()
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie).build()
    }
}
