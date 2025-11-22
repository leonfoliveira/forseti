package live.forseti.core.port.dto.input.clarification

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

data class CreateClarificationInputDTO(
    val problemId: UUID? = null,
    val parentId: UUID? = null,
    @field:NotBlank
    @field:Size(max = 255)
    val text: String,
)
