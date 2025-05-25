package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.util.UUID

object CreateSubmissionInputDTOMockFactory {
    fun build(
        language: Language = Language.PYTHON_3_13_3,
        codeKey: UUID = UUID.randomUUID(),
    ) = CreateSubmissionInputDTO(
        language = language,
        codeKey = codeKey,
    )
}
