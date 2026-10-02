package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Member
import java.time.OffsetDateTime
import java.util.UUID

data class Session(
    val id: UUID,
    val contestId: UUID?,
    val member: Member,
    val csrfToken: UUID,
    val expiresAt: OffsetDateTime,
) {
    data class Member(
        val id: UUID,
        val type: Member.Type,
        val name: String,
    )
}
