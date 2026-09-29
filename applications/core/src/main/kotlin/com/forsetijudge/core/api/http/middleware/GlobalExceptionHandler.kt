package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.http.dto.response.ErrorResponseBodyDTO
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.util.SafeLogger
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.BindException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.HandlerMethod
import org.springframework.web.method.annotation.HandlerMethodValidationException
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.resource.NoResourceFoundException

@RestControllerAdvice
@Suppress("unused")
class GlobalExceptionHandler {
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

    /**
     * Handles bean validation errors on @RequestBody/@Valid arguments (400).
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponseBodyDTO> {
        val message =
            ex.bindingResult.fieldErrors
                .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
                .ifBlank { "Validation failed" }
        logger.info("Validation error occurred, message: $message")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO(message))
    }

    /**
     * Handles bean validation errors on bound objects, e.g. @ModelAttribute (400).
     */
    @ExceptionHandler(BindException::class)
    fun handleBindException(ex: BindException): ResponseEntity<ErrorResponseBodyDTO> {
        val message =
            ex.bindingResult.fieldErrors
                .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
                .ifBlank { "Validation failed" }
        logger.info("Binding error occurred, message: $message")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO(message))
    }

    /**
     * Handles bean validation errors on @Validated method parameters, e.g. @RequestParam/@PathVariable (400).
     */
    @ExceptionHandler(HandlerMethodValidationException::class)
    fun handleHandlerMethodValidationException(ex: HandlerMethodValidationException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Method validation error occurred, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO(ex.message))
    }

    /**
     * Handles constraint violations from method/parameter validation not going through Spring MVC binding (400).
     */
    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolationException(ex: ConstraintViolationException): ResponseEntity<ErrorResponseBodyDTO> {
        val message =
            ex.constraintViolations
                .joinToString(", ") { "${it.propertyPath}: ${it.message}" }
                .ifBlank { "Validation failed" }
        logger.info("Constraint violation occurred, message: $message")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO(message))
    }

    /**
     * Handles malformed or unreadable request bodies, e.g. invalid JSON (400).
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Malformed request body, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO("Malformed request body"))
    }

    /**
     * Handles missing required request parameters (400).
     */
    @ExceptionHandler(MissingServletRequestParameterException::class)
    fun handleMissingServletRequestParameterException(ex: MissingServletRequestParameterException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Missing request parameter, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO(ex.message))
    }

    /**
     * Handles request parameters/path variables that cannot be converted to the expected type (400).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleMethodArgumentTypeMismatchException(ex: MethodArgumentTypeMismatchException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Argument type mismatch, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponseBodyDTO("Invalid value for parameter '${ex.name}'"))
    }

    /**
     * Handles requests to unknown routes (404).
     */
    @ExceptionHandler(NoResourceFoundException::class)
    fun handleNoResourceFoundException(ex: NoResourceFoundException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Resource not found, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponseBodyDTO("Resource not found"))
    }

    /**
     * Handles requests using an unsupported HTTP method for the route (405).
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException::class)
    fun handleHttpRequestMethodNotSupportedException(ex: HttpRequestMethodNotSupportedException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Method not supported, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED)
            .body(ErrorResponseBodyDTO(ex.message ?: "HTTP method not supported"))
    }

    /**
     * Handles requests with an unsupported Content-Type (415).
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException::class)
    fun handleHttpMediaTypeNotSupportedException(ex: HttpMediaTypeNotSupportedException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Media type not supported, message: ${ex.message}")
        return ResponseEntity
            .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
            .body(ErrorResponseBodyDTO(ex.message ?: "Media type not supported"))
    }

    /**
     * Handles exceptions that already carry an intended HTTP status.
     */
    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException): ResponseEntity<ErrorResponseBodyDTO> {
        logger.info("Response status exception occurred, status: ${ex.statusCode}, message: ${ex.message}")
        return ResponseEntity
            .status(ex.statusCode)
            .body(ErrorResponseBodyDTO(ex.reason ?: "Request failed"))
    }

    /**
     * Handles all other uncaught exceptions (500).
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponseBodyDTO> {
        logger.error("Unexpected error occurred, message: ${ex.message}", ex)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponseBodyDTO("An unexpected error occurred"))
    }
}
