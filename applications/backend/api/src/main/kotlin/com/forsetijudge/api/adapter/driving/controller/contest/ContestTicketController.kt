package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.dto.response.ErrorResponseDTO
import com.forsetijudge.api.adapter.dto.response.ticket.TicketResponseDTO
import com.forsetijudge.api.adapter.dto.response.ticket.toResponseDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driving.usecase.ticket.CreateTicketUseCase
import com.forsetijudge.core.port.driving.usecase.ticket.FindTicketUseCase
import com.forsetijudge.core.port.driving.usecase.ticket.UpdateTicketUseCase
import com.forsetijudge.core.port.dto.input.ticket.CreateTicketInputDTO
import com.forsetijudge.core.port.dto.request.UpdateTicketStatusRequestDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
class ContestTicketController(
    private val createTicketUseCase: CreateTicketUseCase,
    private val updateTicketUseCase: UpdateTicketUseCase,
    private val findTicketUseCase: FindTicketUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/tickets")
    @Private
    @Operation(summary = "Create a ticket for a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successfully created a ticket"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid input data",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateTicketInputDTO,
    ): ResponseEntity<TicketResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/tickets $body")
        val member = RequestContext.getContext().session!!.member
        val ticket = createTicketUseCase.create(contestId, member.id, body)
        return ResponseEntity.ok(ticket.toResponseDTO())
    }

    @PutMapping("/contests/{contestId}/tickets/{ticketId}:update-status")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)
    @Operation(summary = "Update the status of a ticket")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successfully updated the ticket status"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid input data",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest or ticket not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun updateStatus(
        @PathVariable contestId: UUID,
        @PathVariable ticketId: UUID,
        @RequestBody body: UpdateTicketStatusRequestDTO,
    ): ResponseEntity<TicketResponseDTO> {
        logger.info("[PUT] /v1/contests/$contestId/tickets/$ticketId $body")
        val member = RequestContext.getContext().session!!.member
        val ticket = updateTicketUseCase.updateStatus(contestId, ticketId, member.id, body.status)
        return ResponseEntity.ok(ticket.toResponseDTO())
    }

    @GetMapping("/contests/{contestId}/tickets")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)
    @Operation(summary = "Get all tickets for a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successfully retrieved the tickets"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid contest ID",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun findAllByContestId(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<TicketResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/tickets")
        val member = RequestContext.getContext().session!!.member
        val tickets = findTicketUseCase.findAllByContestId(contestId, member.id)
        return ResponseEntity.ok(tickets.map { it.toResponseDTO() })
    }

    @GetMapping("/contests/{contestId}/tickets/members/me")
    @Private
    @Operation(summary = "Get all tickets for the signed-in member in a contest")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successfully retrieved the tickets"),
            ApiResponse(
                responseCode = "400",
                description = "Invalid contest ID",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "403",
                description = "Forbidden",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun findAllBySignedInMember(
        @PathVariable contestId: UUID,
    ): ResponseEntity<List<TicketResponseDTO>> {
        logger.info("[GET] /v1/contests/$contestId/tickets/members/me")
        val member = RequestContext.getContext().session!!.member
        val tickets = findTicketUseCase.findAllByContestIdAndMemberId(contestId, member.id)
        return ResponseEntity.ok(tickets.map { it.toResponseDTO() })
    }
}
