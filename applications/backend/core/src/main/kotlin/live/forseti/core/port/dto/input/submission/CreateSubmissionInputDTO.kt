package live.forseti.core.port.dto.input.submission

import live.forseti.core.domain.entity.Submission
import live.forseti.core.port.dto.input.attachment.AttachmentInputDTO
import org.jetbrains.annotations.NotNull
import java.util.UUID

data class CreateSubmissionInputDTO(
    @NotNull
    val problemId: UUID,
    @NotNull
    val language: Submission.Language,
    @NotNull
    val code: AttachmentInputDTO,
)
