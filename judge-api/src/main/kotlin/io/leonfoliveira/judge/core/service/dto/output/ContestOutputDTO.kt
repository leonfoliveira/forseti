package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

data class ContestOutputDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberDTO>,
    val problems: List<ProblemDTO>,
) {
    data class MemberDTO(
        val id: UUID,
        val type: String,
        val name: String,
        val score: Int,
        val penalty: Int,
        val problems: List<MemberProblemDTO>,
    ) {
        data class MemberProblemDTO(
            val id: UUID,
            val isAccepted: Boolean,
            val wrongSubmissions: Int,
            val penalty: Int,
        )
    }

    data class ProblemDTO(
        val id: UUID,
        val letter: Char,
        val title: String,
        val description: Attachment,
    )
}
