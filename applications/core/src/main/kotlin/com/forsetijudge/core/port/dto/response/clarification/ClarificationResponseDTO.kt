package com.forsetijudge.core.port.dto.response.clarification

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseDTO
import java.time.OffsetDateTime
import java.util.UUID

data class ClarificationResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val contest: ContestResponseDTO,
    val problem: ProblemResponseDTO?,
    val member: MemberResponseDTO,
    val text: String,
    val answer: Answer?,
    val isPublic: Boolean,
    val version: Long,
) {
    data class Answer(
        val member: MemberResponseDTO,
        val text: String,
        val createdAt: OffsetDateTime,
    )
}

fun Clarification.toResponseDTO(): ClarificationResponseDTO =
    ClarificationResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        contest = contest.toResponseDTO(),
        problem = problem?.toResponseDTO(),
        member = member.toResponseDTO(),
        text = text,
        answer = answer?.let { ClarificationResponseDTO.Answer(it.member.toResponseDTO(), it.text, it.createdAt) },
        isPublic = isPublic,
        version = version,
    )
