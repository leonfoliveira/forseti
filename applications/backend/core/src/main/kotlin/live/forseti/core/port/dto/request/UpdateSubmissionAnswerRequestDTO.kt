package live.forseti.core.port.dto.request

import jakarta.validation.constraints.NotNull
import live.forseti.core.domain.entity.Submission

data class UpdateSubmissionAnswerRequestDTO(
    @NotNull
    val answer: Submission.Answer,
)
