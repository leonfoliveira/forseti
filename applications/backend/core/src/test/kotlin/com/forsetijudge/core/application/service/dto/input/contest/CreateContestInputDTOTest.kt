package com.forsetijudge.core.application.service.dto.input.contest

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.input.contest.CreateContestInputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import jakarta.validation.Validation
import java.time.OffsetDateTime

class CreateContestInputDTOTest :
    FunSpec({
        context("validation") {
            val inputDTO =
                CreateContestInputDTO(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                )

            val validator = Validation.buildDefaultValidatorFactory().validator

            listOf(
                inputDTO.copy(slug = ""),
                inputDTO.copy(slug = "invalid slug"),
                inputDTO.copy(slug = "a".repeat(33)),
                inputDTO.copy(title = ""),
                inputDTO.copy(slug = "a".repeat(256)),
                inputDTO.copy(languages = emptyList()),
                inputDTO.copy(startAt = OffsetDateTime.now().minusHours(1)),
                inputDTO.copy(endAt = OffsetDateTime.now().minusHours(1)),
                inputDTO.copy(startAt = OffsetDateTime.now().plusHours(2), endAt = OffsetDateTime.now().plusHours(1)),
            ).forEachIndexed { idx, invalidInputDTO ->
                test("should throw validation exception for invalid input #$idx") {
                    val violations = validator.validate(invalidInputDTO)
                    violations.isNotEmpty() shouldBe true
                }
            }
        }
    })
