package com.forsetijudge.api.adapter.dto.response.member

import com.forsetijudge.core.domain.entity.Member
import java.io.Serializable
import java.util.UUID

data class MemberPublicResponseDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
    val version: Long,
) : Serializable

fun Member.toPublicResponseDTO(): MemberPublicResponseDTO =
    MemberPublicResponseDTO(
        id = id,
        type = type,
        name = name,
        version = version,
    )
