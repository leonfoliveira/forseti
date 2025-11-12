package io.github.leonfoliveira.forseti.common.domain.exception

/**
 * Forbidden exception class for handling errors related to lack of permissions from the logged-in user
 */
class ForbiddenException(
    message: String = "Forbidden",
) : BusinessException(message)
