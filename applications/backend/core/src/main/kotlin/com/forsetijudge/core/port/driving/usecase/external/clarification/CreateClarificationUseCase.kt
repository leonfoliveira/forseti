package com.forsetijudge.core.port.driving.usecase.external.clarification

import com.forsetijudge.core.domain.entity.Clarification
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

interface CreateClarificationUseCase {
    /**
     * Creates a new clarification for a contest.
     *
     * @param command The command object containing the details of the clarification to be created.
     * @return The created clarification.
     */
    fun execute(
        @Valid command: Command,
    ): Clarification

    /**
     * Command object for creating a clarification.
     *
     * @param problemId The ID of the problem the clarification is related to (optional).
     * @param parentId The ID of the parent clarification if this is a reply (optional).
     * @param text The text of the clarification. Must not be blank and must be at most 255 characters long.
     */
    data class Command(
        val problemId: UUID? = null,
        val parentId: UUID? = null,
        @field:NotBlank(message = "'text' must not be blank")
        @field:Size(max = 500, message = "'text' must be at most 500 characters long")
        val text: String,
    )
}
