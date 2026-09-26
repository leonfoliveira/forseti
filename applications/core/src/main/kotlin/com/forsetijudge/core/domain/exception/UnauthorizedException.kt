package com.forsetijudge.core.domain.exception

/**
 * Unauthorized exception class for handling errors related requests without proper authentication
 */
class UnauthorizedException(
    message: String = "Unauthorized",
) : BusinessException(message)
