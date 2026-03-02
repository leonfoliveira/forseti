package com.forsetijudge.core.port.dto.response.clarification

import com.forsetijudge.core.domain.entity.Clarification
import java.io.Serializable
import java.util.UUID

data class ClarificationIdResponseBodyDTO(
    val id: UUID,
) : Serializable

fun Clarification.toIdResponseBodyDTO(): ClarificationIdResponseBodyDTO =
    ClarificationIdResponseBodyDTO(
        id = this.id,
    )
