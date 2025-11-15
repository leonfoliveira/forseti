package io.github.leonfoliveira.forseti.common.application.domain.exception

/**
 * Conflict exception class for handling errors related to resource conflicts, such as duplicate entries
 */
class ConflictException(
    message: String = "Conflict",
) : BusinessException(message)
