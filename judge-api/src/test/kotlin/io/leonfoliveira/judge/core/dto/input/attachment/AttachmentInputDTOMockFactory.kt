package io.leonfoliveira.judge.core.dto.input.attachment

import io.leonfoliveira.judge.core.service.dto.input.attachment.AttachmentInputDTO
import java.util.UUID

object AttachmentInputDTOMockFactory {
    fun build(id: UUID = UUID.randomUUID()) = AttachmentInputDTO(id = id)
}