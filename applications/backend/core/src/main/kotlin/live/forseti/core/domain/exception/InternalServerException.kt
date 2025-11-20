package live.forseti.core.domain.exception

import java.lang.RuntimeException

/**
 * Internal server exception class for handling unexpected server errors
 */
class InternalServerException(
    message: String,
) : RuntimeException(message)
