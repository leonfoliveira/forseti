package com.forsetijudge.core.port.dto.response.session

import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class SessionResponseBodyDTO(
    val id: UUID,
    val contest: ContestResponseBodyDTO?,
    val member: MemberResponseBodyDTO,
    val csrfToken: UUID,
    val expiresAt: OffsetDateTime,
    val version: Long,
) : Serializable

fun Session.toResponseBodyDTO() =
    SessionResponseBodyDTO(
        id = id,
        contest = contest?.toResponseBodyDTO(),
        member = member.toResponseBodyDTO(),
        csrfToken = csrfToken,
        expiresAt = expiresAt,
        version = version,
    )
