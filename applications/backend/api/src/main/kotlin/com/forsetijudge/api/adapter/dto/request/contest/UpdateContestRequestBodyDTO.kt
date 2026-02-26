package com.forsetijudge.api.adapter.dto.request.contest

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.forsetijudge.api.adapter.dto.request.attachment.AttachmentRequestBodyDTO
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateContestRequestBodyDTO(
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val autoFreezeAt: OffsetDateTime? = null,
    val settings: Settings,
    val members: List<Member>,
    val problems: List<Problem>,
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Settings(
        val isAutoJudgeEnabled: Boolean,
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Member(
        val id: UUID? = null,
        val type: Member.Type,
        val name: String,
        val login: String,
        val password: String? = null,
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Problem(
        val id: UUID? = null,
        val letter: Char,
        val color: String,
        val title: String,
        val description: AttachmentRequestBodyDTO,
        val timeLimit: Int,
        val memoryLimit: Int,
        val testCases: AttachmentRequestBodyDTO,
    )
}
