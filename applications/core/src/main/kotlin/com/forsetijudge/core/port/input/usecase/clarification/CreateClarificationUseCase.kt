package com.forsetijudge.core.port.input.usecase.clarification

import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

interface CreateClarificationUseCase {
    /**
     * Creates a clarification for a given contest and problem.
     *
     * @param command The command containing the contest ID, optional problem ID, and clarification text.
     * @return A ClarificationResponseDTO representing the created clarification.
     */
    fun execute(
        @Valid command: Command,
    ): ClarificationResponseDTO

    /**
     * Command class representing the input data required to create a clarification.
     *
     * @property contestId The unique identifier of the contest for which the clarification is being created.
     * @property problemId The optional unique identifier of the problem for which the clarification is being created. Can be null if the clarification is not specific to a problem.
     * @property text The text of the clarification being created.
     */
    data class Command(
        val contestId: UUID,
        val problemId: UUID?,
        @field:NotBlank(message = "'text' must not be blank")
        @field:Size(max = 500, message = "'text' must be at most 500 characters long")
        val text: String,
    )
}
