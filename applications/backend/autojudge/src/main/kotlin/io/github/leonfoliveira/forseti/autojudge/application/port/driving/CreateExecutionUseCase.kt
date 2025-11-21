package io.github.leonfoliveira.forseti.autojudge.application.port.driving

import io.github.leonfoliveira.forseti.autojudge.application.dto.input.CreateExecutionInputDTO
import live.forseti.core.domain.entity.Execution

interface CreateExecutionUseCase {
    /**
     * Creates a new execution based on the provided input data.
     *
     * @param inputDTO The data required to create the execution.
     * @return The created execution entity.
     */
    fun create(inputDTO: CreateExecutionInputDTO): Execution
}
