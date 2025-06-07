package io.leonfoliveira.judge.core.service.dto.input

import java.util.UUID

object AttachmentInputDTOMockFactory {
    fun build(id: UUID = UUID.randomUUID()) = AttachmentInputDTO(id = id)
}
