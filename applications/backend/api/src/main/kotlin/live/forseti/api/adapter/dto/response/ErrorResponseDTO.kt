package live.forseti.api.adapter.dto.response

import java.io.Serializable

data class ErrorResponseDTO(
    val message: String,
) : Serializable
