package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language

object CreateSubmissionInputDTOMockFactory {
    fun build(
        problemId: Int = 1,
        language: Language = Language.PYTHON_3_13_3,
        code: AttachmentInputDTO = AttachmentInputDTOMockFactory.build(),
    ) = CreateSubmissionInputDTO(
        problemId = problemId,
        language = language,
        code = code,
    )
}
