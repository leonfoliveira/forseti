package io.leonfoliveira.judge.api.controller.dto

import io.leonfoliveira.judge.api.controller.dto.request.AttachmentRequestDTO
import io.leonfoliveira.judge.api.controller.dto.request.CreateSubmissionRequestDTO
import io.leonfoliveira.judge.core.domain.enumerate.Language

object CreateSubmissionRequestDTOMockFactory {
    fun build(
        language: Language = Language.PYTHON_3_13_3,
        filename: String = "Main.java",
    ) = CreateSubmissionRequestDTO(
        language = language,
        code =
            AttachmentRequestDTO(
                filename = filename,
                content = "Y29kZQ==",
            ),
    )
}
