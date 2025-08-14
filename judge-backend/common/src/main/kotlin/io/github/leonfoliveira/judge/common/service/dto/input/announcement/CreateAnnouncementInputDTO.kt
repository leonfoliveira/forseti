package io.github.leonfoliveira.judge.common.service.dto.input.announcement

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateAnnouncementInputDTO(
    @field:NotBlank
    @field:Size(max = 255)
    val text: String,
)
