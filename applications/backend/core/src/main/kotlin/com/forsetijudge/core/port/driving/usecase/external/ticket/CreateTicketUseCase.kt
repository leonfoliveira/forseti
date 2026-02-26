package com.forsetijudge.core.port.driving.usecase.external.ticket

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Ticket
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertTrue
import java.util.UUID

interface CreateTicketUseCase {
    /**
     * Creates a new ticket for a contest.
     *
     * @param command The command containing the ticket details.
     * @return The result of the ticket creation, including the created ticket details.
     */
    fun execute(
        @Valid command: Command,
    ): Ticket<*>

    /**
     * Command for creating a ticket
     *
     * @param type The type of the ticket.
     * @param properties A map containing the properties of the ticket, which must adhere to the requirements based on the ticket type.
     * - For SUBMISSION_PRINT tickets, the properties must include a valid "submissionId" (UUID) and "attachmentId" (UUID).
     * - For TECHNICAL_SUPPORT tickets, the properties must include a non-empty "description" (string with length between 1 and 512 characters).
     * - For NON_TECHNICAL_SUPPORT tickets, the properties must include a non-empty "description" (string with length between 1 and 512 characters).
     */
    data class Command(
        val type: Ticket.Type,
        val properties: Map<String, Any>,
    ) {
        @get:JsonIgnore
        @get:AssertTrue(message = "'properties' must contain uuid 'submissionId' and 'attachmentId' for SUBMISSION_PRINT tickets")
        val isValidSubmissionPrintTicket: Boolean
            get() {
                if (type != Ticket.Type.SUBMISSION_PRINT) return true

                val submissionId = properties["submissionId"] as? String ?: return false
                try {
                    UUID.fromString(submissionId)
                } catch (e: IllegalArgumentException) {
                    return false
                }

                val attachmentId = properties["attachmentId"] as? String ?: return false
                try {
                    UUID.fromString(attachmentId)
                } catch (e: IllegalArgumentException) {
                    return false
                }

                return true
            }

        @get:JsonIgnore
        @get:AssertTrue(
            message = "'properties' must contain a 'description' field with at most 500 characters for TECHNICAL_SUPPORT tickets",
        )
        val isValidTechnicalSupportTicket: Boolean
            get() {
                if (type != Ticket.Type.TECHNICAL_SUPPORT) return true

                val description = properties["description"] as? String ?: return false
                return description.length in 1..500
            }

        @get:JsonIgnore
        @get:AssertTrue(
            message = "'properties' must contain a 'description' field with at most 500 characters for NON_TECHNICAL_SUPPORT tickets",
        )
        val isValidNonTechnicalSupportTicket: Boolean
            get() {
                if (type != Ticket.Type.NON_TECHNICAL_SUPPORT) return true

                val description = properties["description"] as? String ?: return false
                return description.length in 1..500
            }
    }
}
