package io.github.leonfoliveira.judge.api.dto.response.clarification

import io.github.leonfoliveira.judge.api.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.problem.ProblemPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.problem.toPublicResponseDTO
import io.github.leonfoliveira.judge.core.domain.entity.Clarification
import java.time.OffsetDateTime
import java.util.UUID

data class ClarificationResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val member: MemberPublicResponseDTO,
    val problem: ProblemPublicResponseDTO?,
    val text: String,
    val children: List<ClarificationResponseDTO>,
)

fun Clarification.toResponseDTO(): ClarificationResponseDTO {
    return ClarificationResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        member = this.member.toPublicResponseDTO(),
        problem = this.problem?.toPublicResponseDTO(),
        text = this.text,
        children = this.children.map { it.toResponseDTO() },
    )
}