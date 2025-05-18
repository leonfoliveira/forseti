package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.Attachment

object CreateSubmissionInputDTOMockFactory {
    fun build(
        language: Language = Language.PYTHON_3_13_3,
        code: Attachment = Attachment("code.py", "key"),
    ) = CreateSubmissionInputDTO(
        language = language,
        code = code,
    )
}
