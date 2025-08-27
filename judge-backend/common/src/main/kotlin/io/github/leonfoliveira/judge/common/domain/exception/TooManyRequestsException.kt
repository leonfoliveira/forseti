package io.github.leonfoliveira.judge.common.domain.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
class TooManyRequestsException(
    override val message: String = "Too many requests. Please try again later.",
    val retryAfterSeconds: Long? = null
) : RuntimeException(message)
