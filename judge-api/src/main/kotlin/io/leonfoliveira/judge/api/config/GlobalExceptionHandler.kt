package io.leonfoliveira.judge.api.config

import io.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.leonfoliveira.judge.core.exception.BusinessException
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.exception.UnauthorizedException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageConversionException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.HandlerMethod

@RestControllerAdvice
class GlobalExceptionHandler {
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    private val codesByBusinessException =
        mapOf(
            NotFoundException::class to HttpStatus.NOT_FOUND,
            UnauthorizedException::class to HttpStatus.UNAUTHORIZED,
        )

    @ExceptionHandler(BusinessException::class)
    fun handleException(
        ex: BusinessException,
        handlerMethod: HandlerMethod,
    ): ResponseEntity<ErrorResponseDTO> {
        val status = codesByBusinessException[ex::class] ?: HttpStatus.BAD_REQUEST
        logger.warn(ex.message)
        return ResponseEntity
            .status(status)
            .body(ErrorResponseDTO(ex.message ?: "Business exception"))
    }

    @ExceptionHandler(HttpMessageConversionException::class)
    fun handleException(ex: HttpMessageConversionException): ResponseEntity<ErrorResponseDTO> {
        logger.warn(ex.message)
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseDTO("Validation error"))
    }

    @ExceptionHandler(Exception::class)
    fun handleException(
        ex: Exception,
        handlerMethod: HandlerMethod,
    ): ResponseEntity<ErrorResponseDTO> {
        logger.error(
            "Error thrown from method {}#{}: {}",
            handlerMethod.method.declaringClass.simpleName,
            handlerMethod.method.name,
            ex.message,
            ex,
        )
        return ResponseEntity.internalServerError().body(ErrorResponseDTO("Something went wrong"))
    }
}