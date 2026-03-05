package com.forsetijudge.core.port.driving.usecase.external.attachment

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

interface UploadAttachmentUseCase {
    /**
     * Uploads an attachment to a contest.
     *
     * @param command The command containing the details of the attachment to be uploaded.
     * @return The uploaded attachment entity, including its ID and metadata.
     */
    fun execute(
        @Valid command: Command,
    ): Pair<AttachmentResponseDTO, ByteArray>

    /**
     * Command class for uploading an attachment.
     *
     * @param filename The original filename of the attachment (nullable).
     * @param contentType The MIME type of the attachment (nullable).
     * @param context The context of the attachment, indicating its purpose or usage.
     * @param bytes The byte array representing the content of the attachment.
     */
    class Command(
        @field:Pattern(regexp = ".+", message = "'filename' must not be blank")
        @field:Size(max = 255, message = "'filename' must not exceed 255 characters")
        val filename: String?,
        @field:Pattern(regexp = "[^/]+/[^/]+", message = "'contentType' must be a valid MIME type")
        @field:Size(max = 30, message = "'contentType' must not exceed 30 characters")
        val contentType: String,
        val context: Attachment.Context,
        val bytes: ByteArray,
    ) {
        @get:JsonIgnore
        @get:AssertTrue(message = "'contentType' must be 'application/pdf' PROBLEM_DESCRIPTION attachments")
        val isProblemDescriptionContentTypeValid: Boolean
            get() {
                return context != Attachment.Context.PROBLEM_DESCRIPTION || contentType == "application/pdf"
            }

        @get:JsonIgnore
        @get:AssertTrue(message = "'contentType' must be 'text/csv' for PROBLEM_TEST_CASES attachments")
        val isProblemTestCaseContentTypeValid: Boolean
            get() {
                return context != Attachment.Context.PROBLEM_TEST_CASES || contentType == "text/csv"
            }

        @get:JsonIgnore
        @get:AssertTrue(message = "'contentType' must start with 'text/' for SUBMISSION_CODE attachments")
        val isSubmissionCodeContentTypeValid: Boolean
            get() {
                return context != Attachment.Context.SUBMISSION_CODE || contentType.startsWith("text/")
            }
    }
}
