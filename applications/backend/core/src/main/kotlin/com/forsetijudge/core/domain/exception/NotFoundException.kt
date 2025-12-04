package com.forsetijudge.core.domain.exception

/**
 * Not found exception class for handling resource not found errors
 */
class NotFoundException(
    message: String = "NotFound",
) : BusinessException(message)
