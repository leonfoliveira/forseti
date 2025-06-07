package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.util.UUID

object CreateSubmissionInputDTOMockFactory {
    fun build(
        problemId: UUID = UUID.randomUUID(),
        language: Language = Language.PYTHON_3_13_3,
        code: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
    ) = CreateSubmissionInputDTO(
        problemId = problemId,
        language = language,
        code = code,
    )
}
