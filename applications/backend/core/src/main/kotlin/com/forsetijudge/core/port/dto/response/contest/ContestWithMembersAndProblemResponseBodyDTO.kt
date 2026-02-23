package com.forsetijudge.core.port.dto.response.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.member.MemberWithLoginResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toWithLoginResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ContestWithMembersAndProblemsResponseBodyDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val members: List<MemberWithLoginResponseBodyDTO>,
    val problems: List<ProblemWithTestCasesResponseBodyDTO>,
    val version: Long,
) : Serializable

fun Contest.toWithMembersAndProblemsResponseBodyDTO(): ContestWithMembersAndProblemsResponseBodyDTO =
    ContestWithMembersAndProblemsResponseBodyDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { it.toWithLoginResponseBodyDTO() },
        problems = this.problems.map { it.toWithTestCasesResponseBodyDTO() },
        version = this.version,
    )
