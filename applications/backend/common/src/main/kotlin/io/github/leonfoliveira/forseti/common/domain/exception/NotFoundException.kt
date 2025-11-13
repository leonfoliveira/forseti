package io.github.leonfoliveira.forseti.common.domain.exception

/**
 * Not found exception class for handling resource not found errors
 */
class NotFoundException(
    message: String = "NotFound",
) : BusinessException(message)
