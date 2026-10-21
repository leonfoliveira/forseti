package com.forsetijudge.core.port.dto.response.printrequest

import com.forsetijudge.core.domain.entity.PrintRequest
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseDTO
import java.time.OffsetDateTime
import java.util.UUID

data class PrintRequestResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val submission: SubmissionWithCodeResponseDTO,
    val isCompleted: Boolean,
    val version: Long,
)

fun PrintRequest.toResponseDTO(): PrintRequestResponseDTO =
    PrintRequestResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        submission = this.submission.toWithCodeResponseDTO(),
        isCompleted = this.isCompleted,
        version = this.version,
    )
