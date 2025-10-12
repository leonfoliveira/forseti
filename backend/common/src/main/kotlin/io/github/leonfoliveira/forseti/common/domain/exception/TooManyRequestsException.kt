package io.github.leonfoliveira.forseti.common.domain.exception

class TooManyRequestsException(
    message: String = "TooManyRequests",
) : BusinessException(message)
