package com.forsetijudge.core.port.dto.response.member

import com.forsetijudge.core.domain.entity.Member
import java.io.Serializable
import java.util.UUID

data class MemberResponseBodyDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
    val version: Long,
) : Serializable

fun Member.toResponseBodyDTO(): MemberResponseBodyDTO =
    MemberResponseBodyDTO(
        id = id,
        type = type,
        name = name,
        version = version,
    )
