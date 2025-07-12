package io.github.leonfoliveira.judge.api.controller.advice

import io.github.leonfoliveira.judge.common.domain.exception.BusinessException
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.mockk
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.method.HandlerMethod
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException

class GlobalExceptionHandlerTest : FunSpec({
    val sut = GlobalExceptionHandler()

    listOf(
        Pair(BusinessException(), HttpStatus.BAD_REQUEST),
        Pair(NotFoundException(), HttpStatus.NOT_FOUND),
        Pair(UnauthorizedException(), HttpStatus.UNAUTHORIZED),
        Pair(ForbiddenException(), HttpStatus.FORBIDDEN),
    ).forEach { (exception, expectedStatusCode) ->
        test("should handle ${exception::class.simpleName}") {
            val handlerMethod = mockk<HandlerMethod>(relaxed = true)
            val response = sut.handleBusinessException(exception, handlerMethod)
            response.statusCode shouldBe expectedStatusCode
            response.body?.message shouldBe exception.message
        }
    }

    test("should handle MethodArgumentNotValidException") {
        val exception = mockk<MethodArgumentNotValidException>(relaxed = true)
        val response = sut.handleValidationExceptions(exception)
        response.statusCode shouldBe HttpStatus.BAD_REQUEST
    }

    test("should handle ConstraintViolationException") {
        val exception = mockk<ConstraintViolationException>(relaxed = true)
        val response = sut.handleConstraintViolation(exception)
        response.statusCode shouldBe HttpStatus.BAD_REQUEST
    }

    test("should handle HttpMessageNotReadableException") {
        val exception = mockk<HttpMessageNotReadableException>(relaxed = true)
        val response = sut.handleJsonParseErrors(exception)
        response.statusCode shouldBe HttpStatus.BAD_REQUEST
    }

    test("should handle MethodArgumentTypeMismatchException") {
        val exception = mockk<MethodArgumentTypeMismatchException>(relaxed = true)
        val response = sut.handleTypeMismatch(exception)
        response.statusCode shouldBe HttpStatus.BAD_REQUEST
    }

    test("should handle HttpRequestMethodNotSupportedException") {
        val exception = HttpRequestMethodNotSupportedException("POST")
        val response = sut.handleMethodNotSupported(exception)
        response.statusCode shouldBe HttpStatus.METHOD_NOT_ALLOWED
    }

    test("should handle generic Exception") {
        val exception = Exception("Generic error")
        val response = sut.handleGenericException(exception)
        response.statusCode shouldBe HttpStatus.INTERNAL_SERVER_ERROR
        response.body?.message shouldBe "An unexpected error occurred"
    }
})
