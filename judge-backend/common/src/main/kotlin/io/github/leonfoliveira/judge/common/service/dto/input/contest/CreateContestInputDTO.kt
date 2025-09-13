package io.github.leonfoliveira.judge.common.service.dto.input.contest

import com.fasterxml.jackson.annotation.JsonIgnore
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.OffsetDateTime

data class CreateContestInputDTO(
    @field:NotBlank
    @field:Size(max = 32)
    @field:Pattern(regexp = "^[a-zA-Z0-9-]+$", message = "Slug can only contain letter, numbers, and hyphens")
    val slug: String,
    @field:NotBlank
    @field:Size(max = 255)
    val title: String,
    @field:NotEmpty
    val languages: List<Language>,
    @field:Future
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
) {
    @get:JsonIgnore
    @get:AssertTrue(message = "endAt must be after start date")
    val isEndAtAfterStartAt: Boolean
        get() = startAt.isBefore(endAt)
}
