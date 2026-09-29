package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Member
import java.time.OffsetDateTime
import java.util.UUID

data class Session(
    val id: UUID,
    val memberId: UUID,
    val memberType: Member.Type,
    val memberName: String,
    val csrfToken: UUID,
    val expiresAt: OffsetDateTime,
)
