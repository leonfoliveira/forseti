package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment

object CreateSubmissionInputDTOMockFactory {
    fun build(
        language: Language = Language.PYTHON_3_13_3,
        code: RawAttachment =
            RawAttachment(
                filename = "code.java",
                content = ByteArray(0),
            ),
    ) = CreateSubmissionInputDTO(
        language = language,
        code = code,
    )
}
