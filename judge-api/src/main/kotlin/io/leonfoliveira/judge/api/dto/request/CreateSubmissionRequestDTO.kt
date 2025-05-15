package io.leonfoliveira.judge.api.dto.request

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTO
import java.util.Base64

data class CreateSubmissionRequestDTO(
    val language: Language,
    val code: AttachmentRequestDTO,
) {
    fun toInputDTO(): CreateSubmissionInputDTO {
        return CreateSubmissionInputDTO(
            language = language,
            code =
                RawAttachment(
                    filename = code.filename,
                    content = Base64.getDecoder().decode(code.content),
                ),
        )
    }
}
