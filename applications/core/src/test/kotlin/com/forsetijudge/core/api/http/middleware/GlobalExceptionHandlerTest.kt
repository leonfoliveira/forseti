package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.http.dto.response.ErrorResponseBodyDTO
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import jakarta.validation.ConstraintViolationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.core.MethodParameter
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.mock.http.MockHttpInputMessage
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.validation.BeanPropertyBindingResult
import org.springframework.validation.BindException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.method.HandlerMethod
import org.springframework.web.method.annotation.HandlerMethodValidationException
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.resource.NoResourceFoundException

class GlobalExceptionHandlerTest {
    private val handler = GlobalExceptionHandler()

    @Test
    fun `maps business exceptions to their specific status and defaults to bad request`() {
        assertResponse(HttpStatus.NOT_FOUND, "missing") {
            handler.handleBusinessException(NotFoundException("missing"), testHandlerMethod())
        }
        assertResponse(HttpStatus.UNAUTHORIZED, "login required") {
            handler.handleBusinessException(UnauthorizedException("login required"), testHandlerMethod())
        }
        assertResponse(HttpStatus.FORBIDDEN, "forbidden") {
            handler.handleBusinessException(ForbiddenException("forbidden"), testHandlerMethod())
        }
        assertResponse(HttpStatus.CONFLICT, "conflict") {
            handler.handleBusinessException(ConflictException("conflict"), testHandlerMethod())
        }
        assertResponse(HttpStatus.BAD_REQUEST, "bad request") {
            handler.handleBusinessException(BusinessException("bad request"), testHandlerMethod())
        }
    }

    @Test
    fun `handles validation and binding errors`() {
        val bindingResult =
            BeanPropertyBindingResult(ValidationFixture(), "request").apply {
                rejectValue("name", "invalid", "must not be blank")
            }
        val argumentException = MethodArgumentNotValidException(testMethodParameter(), bindingResult)

        assertResponse(HttpStatus.BAD_REQUEST, "name: must not be blank") {
            handler.handleMethodArgumentNotValidException(argumentException)
        }
        assertResponse(HttpStatus.BAD_REQUEST, "name: must not be blank") {
            handler.handleBindException(BindException(bindingResult))
        }
        assertResponse(HttpStatus.BAD_REQUEST, "Validation failed") {
            handler.handleBindException(BindException(BeanPropertyBindingResult(Any(), "request")))
        }
    }

    @Test
    fun `handles method and constraint validation errors`() {
        val methodValidationException = mock<HandlerMethodValidationException>()
        whenever(methodValidationException.message).thenReturn("parameter validation failed")
        assertResponse(HttpStatus.BAD_REQUEST, "parameter validation failed") {
            handler.handleHandlerMethodValidationException(methodValidationException)
        }
        assertResponse(HttpStatus.BAD_REQUEST, "Validation failed") {
            handler.handleConstraintViolationException(ConstraintViolationException(emptySet()))
        }
    }

    @Test
    fun `handles malformed requests and invalid parameters`() {
        assertResponse(HttpStatus.BAD_REQUEST, "Malformed request body") {
            handler.handleHttpMessageNotReadableException(
                HttpMessageNotReadableException("invalid json", MockHttpInputMessage(ByteArray(0))),
            )
        }
        assertResponse(
            HttpStatus.BAD_REQUEST,
            "Required request parameter 'page' for method parameter type Integer is not present",
        ) {
            handler.handleMissingServletRequestParameterException(
                MissingServletRequestParameterException("page", "Integer"),
            )
        }
        val mismatch =
            MethodArgumentTypeMismatchException(
                "invalid",
                Int::class.javaObjectType,
                "page",
                testMethodParameter(),
                IllegalArgumentException("invalid"),
            )
        assertResponse(HttpStatus.BAD_REQUEST, "Invalid value for parameter 'page'") {
            handler.handleMethodArgumentTypeMismatchException(mismatch)
        }
    }

    @Test
    fun `handles authorization denied and missing resources`() {
        assertResponse(HttpStatus.FORBIDDEN, "Access denied") {
            handler.handleAuthorizationDeniedException(AuthorizationDeniedException("denied"))
        }
        assertResponse(HttpStatus.NOT_FOUND, "Resource not found") {
            handler.handleNoResourceFoundException(NoResourceFoundException(HttpMethod.GET, "/missing", "/missing"))
        }
    }

    @Test
    fun `handles unsupported methods and media types`() {
        val methodException = HttpRequestMethodNotSupportedException("PATCH")
        assertResponse(HttpStatus.METHOD_NOT_ALLOWED, methodException.message!!) {
            handler.handleHttpRequestMethodNotSupportedException(methodException)
        }
        val mediaTypeException =
            HttpMediaTypeNotSupportedException(
                MediaType.APPLICATION_XML,
                listOf(MediaType.APPLICATION_JSON),
                HttpMethod.POST,
            )
        assertResponse(HttpStatus.UNSUPPORTED_MEDIA_TYPE, mediaTypeException.message!!) {
            handler.handleHttpMediaTypeNotSupportedException(mediaTypeException)
        }
    }

    @Test
    fun `preserves response status and reason`() {
        assertResponse(HttpStatus.TOO_MANY_REQUESTS, "slow down") {
            handler.handleResponseStatusException(ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "slow down"))
        }
        assertResponse(HttpStatus.TOO_MANY_REQUESTS, "Request failed") {
            handler.handleResponseStatusException(ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS))
        }
    }

    @Test
    fun `returns generic internal error for uncaught exceptions`() {
        assertResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred") {
            handler.handleGenericException(IllegalStateException("internal detail"))
        }
    }

    private fun assertResponse(
        expectedStatus: HttpStatus,
        expectedMessage: String,
        response: () -> ResponseEntity<ErrorResponseBodyDTO>,
    ) {
        val result = response()
        assertEquals(expectedStatus, result.statusCode)
        assertEquals(expectedMessage, result.body?.message)
    }

    private fun testHandlerMethod(): HandlerMethod =
        HandlerMethod(
            HandlerFixture(),
            HandlerFixture::class.java.getDeclaredMethod("endpoint"),
        )

    private fun testMethodParameter(): MethodParameter =
        MethodParameter(
            HandlerFixture::class.java.getDeclaredMethod("endpoint"),
            -1,
        )

    private class HandlerFixture {
        fun endpoint() = Unit
    }

    private class ValidationFixture {
        var name: String? = null
    }
}
