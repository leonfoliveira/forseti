package io.github.leonfoliveira.forseti.common.application.service.dto.input.announcement

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import jakarta.validation.Validation

class CreateAnnouncementInputDTOTest :
    FunSpec({
        context("validation") {
            val inputDTO =
                CreateAnnouncementInputDTO(
                    text = "This is a test announcement.",
                )

            val validator = Validation.buildDefaultValidatorFactory().validator

            listOf(
                inputDTO.copy(text = ""),
                inputDTO.copy(text = "a".repeat(256)),
            ).forEachIndexed { idx, invalidInputDTO ->
                test("should throw validation exception for invalid input #$idx") {
                    val violations = validator.validate(invalidInputDTO)
                    violations.isNotEmpty() shouldBe true
                }
            }
        }
    })
