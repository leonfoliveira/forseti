package io.github.leonfoliveira.forseti.common.domain.exception

import java.lang.RuntimeException

/**
 * Internal server exception class for handling unexpected server errors
 */
class InternalServerException(
    message: String,
) : RuntimeException(message)
