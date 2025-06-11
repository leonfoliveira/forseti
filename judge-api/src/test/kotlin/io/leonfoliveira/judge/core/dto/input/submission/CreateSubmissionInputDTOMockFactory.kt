package io.leonfoliveira.judge.core.dto.input.submission

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.dto.input.attachment.AttachmentInputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.input.attachment.AttachmentInputDTO
import io.leonfoliveira.judge.core.service.dto.input.submission.CreateSubmissionInputDTO
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