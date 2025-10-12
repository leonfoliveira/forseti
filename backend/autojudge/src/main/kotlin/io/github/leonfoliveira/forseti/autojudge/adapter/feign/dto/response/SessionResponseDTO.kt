package io.github.leonfoliveira.forseti.autojudge.adapter.feign.dto.response

import java.time.OffsetDateTime
import java.util.UUID

data class SessionResponseDTO(
    val id: UUID,
    val expiresAt: OffsetDateTime,
)
