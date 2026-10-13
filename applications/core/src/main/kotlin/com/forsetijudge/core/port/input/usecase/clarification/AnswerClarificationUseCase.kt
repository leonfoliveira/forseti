package com.forsetijudge.core.port.input.usecase.clarification

import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

interface AnswerClarificationUseCase {
    /**
     * Answers a clarification with the provided answer text.
     *
     * @param command The command containing the clarification ID and the answer text.
     * @return A ClarificationResponseDTO representing the answered clarification.
     */
    fun execute(
        @Valid command: Command,
    ): ClarificationResponseDTO

    /**
     * Command class representing the input data required to answer a clarification.
     *
     * @property contestId The unique identifier of the contest to which the clarification belongs.
     * @property clarificationId The unique identifier of the clarification being answered.
     * @property text The text of the answer being provided for the clarification.
     */
    data class Command(
        val contestId: UUID,
        val clarificationId: UUID,
        @field:NotBlank(message = "'text' must not be blank")
        @field:Size(max = 500, message = "'text' must be at most 500 characters long")
        val text: String,
    )
}
