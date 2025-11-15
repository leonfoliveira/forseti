package io.github.leonfoliveira.forseti.api.adapter.dto.response.clarification

import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.toPublicResponseDTO
import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
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
)

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
