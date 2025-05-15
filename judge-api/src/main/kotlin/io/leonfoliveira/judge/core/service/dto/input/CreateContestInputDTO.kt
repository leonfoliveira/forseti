package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.util.TimeUtils
import java.time.LocalDateTime

data class CreateContestInputDTO(
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberDTO>,
    val problems: List<ProblemDTO>,
) {
    data class MemberDTO(
        val type: Member.Type,
        val name: String,
        val login: String,
        val password: String,
    ) {
        fun validate() {
            if (type == Member.Type.ROOT) {
                throw ForbiddenException("Member type cannot be ROOT")
            }
            if (name.isBlank()) {
                throw BusinessException("Name cannot be blank")
            }
            if (login.isBlank()) {
                throw BusinessException("Login cannot be blank")
            }
            if (password.isBlank()) {
                throw BusinessException("Password cannot be blank")
            }
        }
    }

    data class ProblemDTO(
        val title: String,
        val description: String,
        val timeLimit: Int,
        val testCases: RawAttachment,
    ) {
        fun validate() {
            if (title.isBlank()) {
                throw BusinessException("Title cannot be blank")
            }
            if (description.isBlank()) {
                throw BusinessException("Description cannot be blank")
            }
            if (timeLimit <= 0) {
                throw BusinessException("Time limit must be greater than 0")
            }
            if (testCases.filename.isBlank()) {
                throw BusinessException("Test cases filename cannot be blank")
            }
        }
    }

    fun validate() {
        if (title.isBlank()) {
            throw BusinessException("Title cannot be blank")
        }
        if (languages.isEmpty()) {
            throw BusinessException("Languages cannot be empty")
        }
        if (!startAt.isBefore(endAt)) {
            throw BusinessException("Start date must be before end date")
        }
        if (!startAt.isAfter(TimeUtils.now())) {
            throw BusinessException("Start date must be in the future")
        }
        members.forEach { it.validate() }
        problems.forEach { it.validate() }
    }
}
