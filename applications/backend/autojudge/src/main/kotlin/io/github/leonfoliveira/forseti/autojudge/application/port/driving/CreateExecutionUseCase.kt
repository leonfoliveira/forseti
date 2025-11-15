package io.github.leonfoliveira.forseti.autojudge.application.port.driving

import io.github.leonfoliveira.forseti.autojudge.application.dto.input.CreateExecutionInputDTO
import io.github.leonfoliveira.forseti.common.application.domain.entity.Execution

interface CreateExecutionUseCase {
    fun create(inputDTO: CreateExecutionInputDTO): Execution
}
