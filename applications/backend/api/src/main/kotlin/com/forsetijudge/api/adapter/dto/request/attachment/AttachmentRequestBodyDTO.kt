package com.forsetijudge.api.adapter.dto.request.attachment

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
data class AttachmentRequestBodyDTO(
    val id: UUID,
)
