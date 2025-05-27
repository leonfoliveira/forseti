package io.leonfoliveira.judge.core.service.dto.input

import java.util.UUID

object AttachmentInputDTOMockFactory {
    fun build(key: UUID = UUID.randomUUID()) = AttachmentInputDTO(key)
}