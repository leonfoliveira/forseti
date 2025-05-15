package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.util.TimeUtils
import java.time.LocalDateTime

data class UpdateContestInputDTO(
    val id: Int,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberDTO>,
    val problems: List<ProblemDTO>,
) {
    data class MemberDTO(
        val id: Int? = null,
        val type: Member.Type,
        val name: String,
        val login: String,
        val password: String? = null,
    ) {
        fun toCreateDTO(): CreateContestInputDTO.MemberDTO {
            return CreateContestInputDTO.MemberDTO(
                type = type,
                name = name,
                login = login,
                password = password!!,
            )
        }

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
            if (password != null && password.isBlank()) {
                throw BusinessException("Password cannot be blank")
            }
            if (id == null && password == null) {
                throw BusinessException("Password cannot be null when creating a new member")
            }
        }
    }

    data class ProblemDTO(
        val id: Int? = null,
        val title: String,
        val description: String,
        val timeLimit: Int,
        val testCases: RawAttachment? = null,
    ) {
        fun toCreateDTO(): CreateContestInputDTO.ProblemDTO {
            return CreateContestInputDTO.ProblemDTO(
                title = title,
                description = description,
                timeLimit = timeLimit,
                testCases = testCases!!,
            )
        }

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
            if (testCases == null && id == null) {
                throw BusinessException("Test cases cannot be null when creating a new problem")
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
        if (startAt.isAfter(endAt)) {
            throw BusinessException("Start date must be before end date")
        }
        if (!startAt.isAfter(TimeUtils.now())) {
            throw BusinessException("Start date must be in the future")
        }

        members.forEach { it.validate() }
        problems.forEach { it.validate() }
    }
}
