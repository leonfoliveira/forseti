package com.forsetijudge.core.port.dto.input.ticket

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Ticket
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class CreateTicketInputDTO(
    @field:NotNull
    val type: Ticket.Type,
    @field:NotNull
    val properties: Map<String, Any>,
) {
    @get:JsonIgnore
    @get:AssertTrue(message = "Submission print ticket must have a valid submissionId (UUID) and attachment object")
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
    @get:AssertTrue(message = "Technical support ticket must have a non-empty description")
    val isValidTechnicalSupportTicket: Boolean
        get() {
            if (type != Ticket.Type.TECHNICAL_SUPPORT) return true

            val description = properties["description"] as? String ?: return false
            return description.isNotBlank()
        }

    @get:JsonIgnore
    @get:AssertTrue(message = "Non-technical support ticket must have a non-empty description")
    val isValidNonTechnicalSupportTicket: Boolean
        get() {
            if (type != Ticket.Type.NON_TECHNICAL_SUPPORT) return true

            val description = properties["description"] as? String ?: return false
            return description.isNotBlank()
        }
}
