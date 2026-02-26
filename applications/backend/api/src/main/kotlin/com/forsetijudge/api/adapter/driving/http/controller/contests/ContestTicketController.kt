package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.api.adapter.dto.request.ticket.CreateTicketRequestBodyDTO
import com.forsetijudge.api.adapter.dto.request.ticket.UpdateTicketStatusRequestBodyDTO
import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.ticket.CreateTicketUseCase
import com.forsetijudge.core.port.driving.usecase.external.ticket.UpdateTicketStatusUseCase
import com.forsetijudge.core.port.dto.response.ticket.TicketResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestTicketController(
    private val createTicketUseCase: CreateTicketUseCase,
    private val updateTicketStatusUseCase: UpdateTicketStatusUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/tickets")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF, Member.Type.JUDGE, Member.Type.CONTESTANT)
    fun create(
        @PathVariable contestId: UUID,
        @RequestBody body: CreateTicketRequestBodyDTO,
    ): ResponseEntity<TicketResponseBodyDTO> {
        logger.info("[POST] /v1/contests/$contestId/tickets")
        val ticket =
            createTicketUseCase.execute(
                CreateTicketUseCase.Command(
                    type = body.type,
                    properties = body.properties,
                ),
            )
        return ResponseEntity.ok(ticket.toResponseBodyDTO())
    }

    @PutMapping("/contests/{contestId}/tickets/{ticketId}:update-status")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)
    fun updateStatus(
        @PathVariable contestId: UUID,
        @PathVariable ticketId: UUID,
        @RequestBody body: UpdateTicketStatusRequestBodyDTO,
    ): ResponseEntity<TicketResponseBodyDTO> {
        logger.info("[PUT] /v1/contests/$contestId/tickets/$ticketId")
        val ticket =
            updateTicketStatusUseCase.execute(
                UpdateTicketStatusUseCase.Command(
                    ticketId = ticketId,
                    status = body.status,
                ),
            )
        return ResponseEntity.ok(ticket.toResponseBodyDTO())
    }
}
