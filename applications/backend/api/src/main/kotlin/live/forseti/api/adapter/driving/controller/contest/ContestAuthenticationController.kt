package live.forseti.api.adapter.driving.controller.contest

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.api.adapter.dto.response.ErrorResponseDTO
import live.forseti.api.adapter.dto.response.session.SessionResponseDTO
import live.forseti.api.adapter.dto.response.session.toResponseDTO
import live.forseti.api.adapter.util.SessionCookieUtil
import live.forseti.core.port.driving.usecase.authentication.AuthenticateUseCase
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/contests/{contestId}")
class ContestAuthenticationController(
    val authenticateUseCase: AuthenticateUseCase,
    val sessionCookieUtil: SessionCookieUtil,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/sign-in")
    @Operation(
        summary = "Sign in to a contest",
        description = "Authenticate a user to access a specific contest.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Authenticated successfully",
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    @Transactional
    fun authenticateToContest(
        @PathVariable contestId: UUID,
        @RequestBody body: ContestAuthenticateInputDTO,
    ): ResponseEntity<SessionResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/sign-in $body")
        val session = authenticateUseCase.authenticateToContest(contestId, body)
        val cookie = sessionCookieUtil.buildCookie(session)
        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, cookie)
            .body(session.toResponseDTO())
    }
}
