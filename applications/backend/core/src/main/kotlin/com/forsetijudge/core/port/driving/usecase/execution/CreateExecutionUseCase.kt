package com.forsetijudge.core.port.driving.usecase.execution

import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.port.dto.input.execution.CreateExecutionInputDTO

interface CreateExecutionUseCase {
    /**
     * Creates a new execution based on the provided input data.
     *
     * @param inputDTO The data required to create the execution.
     * @return The created execution entity.
     */
    fun create(inputDTO: CreateExecutionInputDTO): Execution
}
