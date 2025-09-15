package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.session.SessionResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.session.toResponseDTO
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.util.SessionUtil
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/session")
class SesssionController {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/me")
    @RateLimit
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
        val session = SessionUtil.getCurrent()
        if (session == null) {
            throw UnauthorizedException()
        }
        return ResponseEntity.ok(session.toResponseDTO())
    }
}
