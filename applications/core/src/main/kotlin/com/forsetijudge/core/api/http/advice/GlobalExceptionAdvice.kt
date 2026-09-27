package com.forsetijudge.core.api.http.advice

import com.forsetijudge.core.api.http.dto.response.ErrorResponseBodyDTO
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.util.SafeLogger
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.HandlerMethod

@RestControllerAdvice
class GlobalExceptionAdvice {
    private val logger = SafeLogger(this::class)

    private val codesByBusinessException =
        mapOf(
            NotFoundException::class to HttpStatus.NOT_FOUND,
            UnauthorizedException::class to HttpStatus.UNAUTHORIZED,
            ForbiddenException::class to HttpStatus.FORBIDDEN,
            ConflictException::class to HttpStatus.CONFLICT,
        )

    /**
     * Handles BusinessException and maps them to appropriate HTTP status codes.
     */
    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        ex: BusinessException,
        handlerMethod: HandlerMethod,
    ): ResponseEntity<ErrorResponseBodyDTO> {
        val status = codesByBusinessException[ex::class] ?: HttpStatus.BAD_REQUEST
        logger.info(
            "${ex.javaClass.simpleName} occurred in method: ${handlerMethod.method.name}, message: ${ex.message}",
        )
        return ResponseEntity
            .status(status)
            .body(ErrorResponseBodyDTO(ex.message!!))
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponseBodyDTO> {
        logger.error("Unexpected error occurred, message: ${ex.message}", ex)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponseBodyDTO("An unexpected error occurred"))
    }
}
