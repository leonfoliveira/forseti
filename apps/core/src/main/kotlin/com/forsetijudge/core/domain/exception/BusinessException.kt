package com.forsetijudge.core.domain.exception

/**
 * Business exception class for handling errors related to business rules
 */
open class BusinessException(
    message: String = "BadRequest",
) : RuntimeException(message)
