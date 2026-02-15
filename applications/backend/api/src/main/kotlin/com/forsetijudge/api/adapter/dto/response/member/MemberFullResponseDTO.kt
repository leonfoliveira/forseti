package com.forsetijudge.api.adapter.dto.response.member

import com.forsetijudge.core.domain.entity.Member
import java.io.Serializable
import java.util.UUID

data class MemberFullResponseDTO(
    val id: UUID,
    val type: Member.Type,
    val name: String,
    val login: String,
    val version: Long,
) : Serializable

fun Member.toFullResponseDTO(): MemberFullResponseDTO =
    MemberFullResponseDTO(
        id = id,
        type = type,
        name = name,
        login = login,
        version = version,
    )
