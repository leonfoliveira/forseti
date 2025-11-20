package live.forseti.core.port.dto.input.submission

import live.forseti.core.domain.entity.Submission
import live.forseti.core.port.dto.input.attachment.AttachmentInputDTO
import java.util.UUID

data class CreateSubmissionInputDTO(
    val problemId: UUID,
    val language: Submission.Language,
    val code: AttachmentInputDTO,
)
