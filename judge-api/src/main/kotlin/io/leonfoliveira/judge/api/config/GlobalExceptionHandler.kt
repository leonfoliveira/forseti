package io.leonfoliveira.judge.api.config

import io.leonfoliveira.judge.api.controller.dto.response.ErrorResponseDTO
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
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
            ForbiddenException::class to HttpStatus.FORBIDDEN,
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

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, String>> {
        val errors =
            ex.bindingResult.fieldErrors
                .groupBy { it.field }
                .mapValues { entry -> entry.value.joinToString(", ") { it.defaultMessage ?: "Invalid value" } }

        return ResponseEntity(errors, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(ex: ConstraintViolationException): ResponseEntity<Map<String, String>> {
        val errors =
            ex.constraintViolations.associate {
                val path = it.propertyPath.toString().split(".").drop(2).joinToString(".")
                path to (it.message ?: "Invalid value")
            }
        return ResponseEntity(errors, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleJsonParseErrors(ex: HttpMessageNotReadableException): ResponseEntity<Map<String, String>> {
        val message = ex.mostSpecificCause.message ?: "Malformed JSON"
        return ResponseEntity(mapOf("error" to "Invalid request format: $message"), HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): ResponseEntity<ErrorResponseDTO> {
        logger.error("An identified exception has being thrown", ex)
        return ResponseEntity.internalServerError().body(ErrorResponseDTO("Something went wrong"))
    }
}
