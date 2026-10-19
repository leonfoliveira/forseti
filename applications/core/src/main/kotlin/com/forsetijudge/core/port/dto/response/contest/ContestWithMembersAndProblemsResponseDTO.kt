package com.forsetijudge.core.port.dto.response.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.member.MemberWithLoginResponseDTO
import com.forsetijudge.core.port.dto.response.member.toWithLoginResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ContestWithMembersAndProblemsResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val isFrozen: Boolean,
    val members: List<MemberWithLoginResponseDTO>,
    val problems: List<ProblemWithTestCasesResponseDTO>,
    val version: Long,
) : Serializable

fun Contest.toWithMembersAndProblemsResponseDTO(): ContestWithMembersAndProblemsResponseDTO =
    ContestWithMembersAndProblemsResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        isFrozen = this.isFrozen(),
        members = this.members.map { it.toWithLoginResponseDTO() },
        problems = this.problems.map { it.toWithTestCasesResponseDTO() },
        version = this.version,
    )
