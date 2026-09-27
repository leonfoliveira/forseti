package com.forsetijudge.core.api.http.dto.request.attachment

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
data class AttachmentRequestBodyDTO(
    val id: UUID,
)
