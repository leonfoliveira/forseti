package io.leonfoliveira.judge.core.service.dto.input

import jakarta.validation.constraints.NotEmpty
import java.util.UUID

data class AttachmentInputDTO(
    @field:NotEmpty
    val key: UUID,
)