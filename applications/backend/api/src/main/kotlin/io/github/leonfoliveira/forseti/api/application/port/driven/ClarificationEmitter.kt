package io.github.leonfoliveira.forseti.api.application.port.driven

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification

interface ClarificationEmitter {
    /**
     * Emits a clarification to the appropriate channels.
     *
     * @param clarification The clarification to be emitted.
     */
    fun emit(clarification: Clarification)

    /**
     * Emits a deleted clarification to the appropriate channels.
     *
     * @param clarification The clarification to be emitted as deleted.
     */
    fun emitDeleted(clarification: Clarification)
}
