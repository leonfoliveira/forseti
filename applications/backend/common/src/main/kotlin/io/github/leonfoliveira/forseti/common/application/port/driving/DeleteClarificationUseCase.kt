package io.github.leonfoliveira.forseti.common.application.port.driving

import java.util.UUID

interface DeleteClarificationUseCase {
    fun delete(id: UUID)
}
