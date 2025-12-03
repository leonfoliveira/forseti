package com.forsetijudge.api.adapter.dto.response.clarification

import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Clarification
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ClarificationResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO?,
    val parentId: UUID? = null,
    val text: String,
    val children: List<ClarificationResponseDTO>,
) : Serializable

fun Clarification.toResponseDTO(): ClarificationResponseDTO =
    ClarificationResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        member = this.member.toPublicResponseDTO(),
        problem = this.problem?.toPublicResponseDTO(),
        parentId = this.parent?.id,
        text = this.text,
        children = this.children.map { it.toResponseDTO() },
    )
