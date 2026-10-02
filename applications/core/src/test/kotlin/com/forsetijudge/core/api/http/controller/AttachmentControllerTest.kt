package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.attachment.SignedUploadAttachmentRequestDTO
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.SignedDownloadAttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.SignedUploadAttachmentResponseDTO
import com.forsetijudge.core.port.input.usecase.attachment.SignedDownloadAttachmentUseCase
import com.forsetijudge.core.port.input.usecase.attachment.SignedUploadAttachmentUseCase
import java.time.OffsetDateTime
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class AttachmentControllerTest {
    private val uploadUseCase = mock<SignedUploadAttachmentUseCase>()
    private val downloadUseCase = mock<SignedDownloadAttachmentUseCase>()
    private val mvc = MockMvcTestSupport.mvc(AttachmentController(uploadUseCase, downloadUseCase))
    private val contestId = UUID.randomUUID()
    private val attachmentId = UUID.randomUUID()
    private val timestamp = OffsetDateTime.parse("2026-10-02T12:00:00Z")

    @Test
    fun `posts upload request and maps fields into use case command`() {
        val response =
            SignedUploadAttachmentResponseDTO(
                attachmentResponse(),
                "https://storage.test/upload",
            )
        whenever(uploadUseCase.execute(any())).thenReturn(response)

        mvc.perform(
            post("/v1/contests/$contestId/attachments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """{"filename":"statement.pdf","context":"PROBLEM_DESCRIPTION","contentType":"application/pdf"}""",
                ),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.uploadUrl").value("https://storage.test/upload"))
            .andExpect(jsonPath("$.attachment.id").value(attachmentId.toString()))

        val captor = argumentCaptor<SignedUploadAttachmentUseCase.Command>()
        verify(uploadUseCase).execute(captor.capture())
        val command = captor.firstValue
        assertEquals(contestId, command.contestId)
        assertEquals("statement.pdf", command.filename)
        assertEquals(Attachment.Context.PROBLEM_DESCRIPTION, command.context)
        assertEquals("application/pdf", command.contentType)
    }

    @Test
    fun `gets signed download and forwards both path ids`() {
        whenever(downloadUseCase.execute(any())).thenReturn(
            SignedDownloadAttachmentResponseDTO(attachmentResponse(), "https://storage.test/download"),
        )

        mvc.perform(get("/v1/contests/$contestId/attachments/$attachmentId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.downloadUrl").value("https://storage.test/download"))
            .andExpect(jsonPath("$.attachment.filename").value("statement.pdf"))

        verify(downloadUseCase).execute(
            SignedDownloadAttachmentUseCase.Command(contestId, attachmentId),
        )
    }

    private fun attachmentResponse() =
        AttachmentResponseDTO(
            id = attachmentId,
            createdAt = timestamp,
            updatedAt = timestamp,
            filename = "statement.pdf",
            contentType = "application/pdf",
            context = Attachment.Context.PROBLEM_DESCRIPTION,
            version = 1,
        )
}
