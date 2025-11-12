package io.github.leonfoliveira.forseti.api.controller.advice

import io.github.leonfoliveira.forseti.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.forseti.common.domain.exception.BusinessException
import io.github.leonfoliveira.forseti.common.domain.exception.ConflictException
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.forseti.common.util.SkipCoverage
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.HandlerMethod
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.servlet.resource.NoResourceFoundException

@RestControllerAdvice
class GlobalExceptionHandler {
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    private val codesByBusinessException =
        mapOf(
            NotFoundException::class to HttpStatus.NOT_FOUND,
            UnauthorizedException::class to HttpStatus.UNAUTHORIZED,
            ForbiddenException::class to HttpStatus.FORBIDDEN,
            ConflictException::class to HttpStatus.CONFLICT,
        )

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        ex: BusinessException,
        handlerMethod: HandlerMethod,
    ): ResponseEntity<ErrorResponseDTO> {
        val status = codesByBusinessException[ex::class] ?: HttpStatus.BAD_REQUEST
        logger.info("BusinessException occurred in method: ${handlerMethod.method.name}, status: $status, message: ${ex.message}")
        return ResponseEntity
            .status(status)
            .body(ErrorResponseDTO(ex.message!!))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, String>> {
        logger.info("Validation error occurred")
        val errors =
            ex.bindingResult.fieldErrors
                .groupBy { it.field }
                .mapValues { entry -> entry.value.joinToString(", ") { it.defaultMessage ?: "Invalid value" } }

        return ResponseEntity(errors, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(ex: ConstraintViolationException): ResponseEntity<Map<String, String>> {
        logger.info("Constraint violation error occurred")
        val errors =
            ex.constraintViolations.associate {
                val path =
                    it.propertyPath
                        .toString()
                        .split(".")
                        .drop(2)
                        .joinToString(".")
                path to (it.message ?: "Invalid value")
            }
        return ResponseEntity(errors, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleJsonParseErrors(ex: HttpMessageNotReadableException): ResponseEntity<Map<String, String>> {
        logger.info("JSON parsing error occurred")
        val message = ex.mostSpecificCause.message ?: "Malformed JSON"
        return ResponseEntity(mapOf("error" to "Invalid request format: $message"), HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatch(ex: MethodArgumentTypeMismatchException): ResponseEntity<ErrorResponseDTO> {
        logger.info("Type mismatch error occurred")
        val message = "Invalid type for parameter '${ex.name}'"
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseDTO(message))
    }

    @ExceptionHandler(NoResourceFoundException::class)
    @SkipCoverage
    fun handleNoResourceFoundException(ex: NoResourceFoundException): ResponseEntity<ErrorResponseDTO> {
        logger.info("Resource not found, message: ${ex.message}", ex)
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponseDTO("Resource not found"))
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun handleMethodNotSupported(ex: HttpRequestMethodNotSupportedException): ResponseEntity<ErrorResponseDTO> {
        logger.info("Method not supported error occurred")
        val message = "Method ${ex.method} is not supported for this endpoint"
        return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED)
            .body(ErrorResponseDTO(message))
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponseDTO> {
        logger.error("Unexpected error occurred, message: ${ex.message}", ex)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponseDTO("An unexpected error occurred"))
    }
}
