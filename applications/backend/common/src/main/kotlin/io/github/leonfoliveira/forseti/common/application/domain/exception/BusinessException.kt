package io.github.leonfoliveira.forseti.common.application.domain.exception

/**
 * Business exception class for handling errors related to business rules
 */
open class BusinessException(
    message: String = "BadRequest",
) : RuntimeException(message)
