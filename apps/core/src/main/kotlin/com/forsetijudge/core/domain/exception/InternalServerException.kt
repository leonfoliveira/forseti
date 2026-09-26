package com.forsetijudge.core.domain.exception

/**
 * Internal server exception class for handling unexpected server errors
 */
class InternalServerException(
    message: String,
) : RuntimeException(message)
