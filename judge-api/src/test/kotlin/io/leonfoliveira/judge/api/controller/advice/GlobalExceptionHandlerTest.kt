package io.leonfoliveira.judge.api.controller.advice

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.api.controller.dto.response.ErrorResponseDTO
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.mockk.every
import io.mockk.mockk
import jakarta.validation.ConstraintViolation
import jakarta.validation.ConstraintViolationException
import jakarta.validation.Path
import org.springframework.core.MethodParameter
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.method.HandlerMethod

class GlobalExceptionHandlerTest : FunSpec({
    val sut = GlobalExceptionHandler()

    listOf(
        Pair(BusinessException("BusinessException"), HttpStatus.BAD_REQUEST),
        Pair(NotFoundException("NotFoundException"), HttpStatus.NOT_FOUND),
        Pair(UnauthorizedException("UnauthorizedException"), HttpStatus.UNAUTHORIZED),
        Pair(ForbiddenException("ForbiddenException"), HttpStatus.FORBIDDEN),
    ).forEach { (ex, status) ->
        test("handleException should return $status for $ex") {
            val handlerMethod = mockk<HandlerMethod>(relaxed = true)

            val response = sut.handleException(ex, handlerMethod)

            response.statusCode shouldBe status
            response.body shouldBe ErrorResponseDTO(ex.message!!)
        }
    }

    test("handleValidationExceptions should return BAD_REQUEST with field errors") {
        val bindingResult = mockk<BindingResult>()
        val fieldError1 =
            FieldError(
                "objectName",
                "field1",
                null,
                false,
                arrayOf("code1"),
                null,
                "Error message 1",
            )
        val fieldError2 =
            FieldError(
                "objectName",
                "field2",
                null,
                false,
                arrayOf("code2"),
                null,
                "Error message 2",
            )
        val fieldError3 =
            FieldError(
                "objectName",
                "field1",
                null,
                false,
                arrayOf("code3"),
                null,
                "Another error for field1",
            )

        every { bindingResult.fieldErrors } returns listOf(fieldError1, fieldError2, fieldError3)

        val exception = MethodArgumentNotValidException(mockk<MethodParameter>(), bindingResult)

        val response = sut.handleValidationExceptions(exception)

        response.statusCode shouldBe HttpStatus.BAD_REQUEST
        response.body shouldBe
            mapOf(
                "field1" to "Error message 1, Another error for field1",
                "field2" to "Error message 2",
            )
    }

    test("handleConstraintViolation should return BAD_REQUEST with constraint violations") {
        val violation1 = mockk<ConstraintViolation<*>>()
        val violation2 = mockk<ConstraintViolation<*>>()

        val path1 = mockk<Path>()
        val path2 = mockk<Path>()

        every { path1.toString() } returns "a.b.field1"
        every { path2.toString() } returns "a.c.nested.field2"

        every { violation1.propertyPath } returns path1
        every { violation1.message } returns "Constraint error 1"
        every { violation2.propertyPath } returns path2
        every { violation2.message } returns "Constraint error 2"

        val exception = ConstraintViolationException(setOf(violation1, violation2))

        val response = sut.handleConstraintViolation(exception)

        response.statusCode shouldBe HttpStatus.BAD_REQUEST
        response.body shouldBe
            mapOf(
                "field1" to "Constraint error 1",
                "nested.field2" to "Constraint error 2",
            )
    }

    test("handleConstraintViolation should return default message if constraint violation message is null") {
        val violation = mockk<ConstraintViolation<*>>()
        val path = mockk<Path>()

        every { path.toString() } returns "a.b.field1"

        every { violation.propertyPath } returns path
        every { violation.message } returns null // Simulate null message

        val exception = ConstraintViolationException(setOf(violation))

        val response = sut.handleConstraintViolation(exception)

        response.statusCode shouldBe HttpStatus.BAD_REQUEST
        response.body shouldBe
            mapOf(
                "field1" to "Invalid value",
            )
    }
})
