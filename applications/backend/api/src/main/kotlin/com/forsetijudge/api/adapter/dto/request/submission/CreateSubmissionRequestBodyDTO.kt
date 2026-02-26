package com.forsetijudge.api.adapter.dto.request.submission

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.forsetijudge.api.adapter.dto.request.attachment.AttachmentRequestBodyDTO
import com.forsetijudge.core.domain.entity.Submission
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateSubmissionRequestBodyDTO(
    val problemId: UUID,
    val language: Submission.Language,
    val code: AttachmentRequestBodyDTO,
)
