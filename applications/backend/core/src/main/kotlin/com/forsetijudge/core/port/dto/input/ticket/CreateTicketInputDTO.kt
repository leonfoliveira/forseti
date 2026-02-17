package com.forsetijudge.core.port.dto.input.ticket

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Ticket
import jakarta.validation.constraints.AssertTrue
import org.jetbrains.annotations.NotNull
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

            // Validate submissionId exists and is a valid UUID string
            val submissionId = properties["submissionId"] as? String ?: return false
            try {
                UUID.fromString(submissionId)
            } catch (e: IllegalArgumentException) {
                return false
            }

            // Validate attachment exists and has required fields
            val attachment = properties["attachment"] as? Map<*, *> ?: return false
            val attachmentId = attachment["id"] as? String ?: return false
            val filename = attachment["filename"] as? String ?: return false
            val contentType = attachment["contentType"] as? String ?: return false
            val version = attachment["version"] ?: return false

            // Validate attachment.id is a valid UUID
            try {
                UUID.fromString(attachmentId)
            } catch (e: IllegalArgumentException) {
                return false
            }

            // Validate version is a number
            if (version !is Number) return false

            return filename.isNotBlank() && contentType.isNotBlank()
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
