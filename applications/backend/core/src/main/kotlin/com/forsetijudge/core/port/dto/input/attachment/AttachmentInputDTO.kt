package com.forsetijudge.core.port.dto.input.attachment

import jakarta.validation.constraints.NotEmpty
import java.util.UUID

data class AttachmentInputDTO(
    @field:NotEmpty
    val id: UUID,
)
