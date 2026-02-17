package com.forsetijudge.core.port.dto.input.submission

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.input.attachment.AttachmentInputDTO
import org.jetbrains.annotations.NotNull
import java.util.UUID

data class CreateSubmissionInputDTO(
    @field:NotNull
    val problemId: UUID,
    @field:NotNull
    val language: Submission.Language,
    @field:NotNull
    val code: AttachmentInputDTO,
)
