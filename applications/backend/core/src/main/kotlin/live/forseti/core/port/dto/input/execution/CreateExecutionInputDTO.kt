package live.forseti.core.port.dto.input.execution

import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.Submission

data class CreateExecutionInputDTO(
    val submission: Submission,
    val answer: Submission.Answer,
    val totalTestCases: Int,
    val lastTestCase: Int?,
    val input: Attachment,
    val output: List<String>,
)
