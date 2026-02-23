package com.forsetijudge.core.port.driving.usecase.external.attachment

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Attachment
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Pattern

interface UploadAttachmentUseCase {
    /**
     * Uploads an attachment to a contest.
     *
     * @param command The command containing the details of the attachment to be uploaded.
     * @return The uploaded attachment entity, including its ID and metadata.
     */
    fun execute(command: Command): Pair<Attachment, ByteArray>

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
        @field:Max(255, message = "'filename' must not exceed 255 characters")
        val filename: String?,
        @field:Pattern(regexp = "\\w+/\\w+", message = "'contentType' must be a valid MIME type")
        @field:Max(30, message = "'contentType' must not exceed 30 characters")
        val contentType: String?,
        val context: Attachment.Context,
        val bytes: ByteArray,
    ) {
        @get:JsonIgnore
        @get:AssertTrue(message = "'contentType' must be 'application/pdf' PROBLEM_DESCRIPTION attachments")
        val isProblemDescriptionContentTypeValid: Boolean
            get() {
                return contentType == "application/pdf"
            }

        @get:JsonIgnore
        @get:AssertTrue(message = "'contentType' must be 'text/csv' for PROBLEM_TEST_CASES attachments")
        val isProblemTestCaseContentTypeValid: Boolean
            get() {
                return contentType == "text/csv"
            }
    }
}
