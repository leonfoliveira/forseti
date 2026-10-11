package com.forsetijudge.core.port.dto.response.clarification

import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import java.time.OffsetDateTime
import java.util.UUID

data class ClarificationResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val contest: ContestResponseBodyDTO,
    val member: MemberResponseBodyDTO,
    val text: String,
    val answer: Answer?,
    val isPublic: Boolean,
    val version: Long,
) {
    data class Answer(
        val member: MemberResponseBodyDTO,
        val text: String,
    )
}

fun Clarification.toResponseDTO(): ClarificationResponseDTO =
    ClarificationResponseDTO(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        contest = contest.toResponseBodyDTO(),
        member = member.toResponseBodyDTO(),
        text = text,
        answer = answer?.let { ClarificationResponseDTO.Answer(it.member.toResponseBodyDTO(), it.text) },
        isPublic = isPublic,
        version = version,
    )
