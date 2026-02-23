package com.forsetijudge.core.port.dto.response.clarification

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ClarificationResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val member: MemberResponseBodyDTO,
    val problem: ProblemResponseBodyDTO?,
    val parentId: UUID? = null,
    val text: String,
    val children: List<ClarificationResponseDTO>,
    val version: Long,
) : Serializable

fun Clarification.toResponseBodyDTO(): ClarificationResponseDTO =
    ClarificationResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        member = this.member.toResponseBodyDTO(),
        problem = this.problem?.toResponseBodyDTO(),
        parentId = this.parent?.id,
        text = this.text,
        children = this.children.map { it.toResponseBodyDTO() },
        version = this.version,
    )
