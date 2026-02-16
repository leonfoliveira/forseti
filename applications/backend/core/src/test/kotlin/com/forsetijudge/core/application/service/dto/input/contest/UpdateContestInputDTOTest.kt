package com.forsetijudge.core.application.service.dto.input.contest

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.input.attachment.AttachmentInputDTO
import com.forsetijudge.core.port.dto.input.contest.UpdateContestInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import jakarta.validation.Validation
import java.time.OffsetDateTime

class UpdateContestInputDTOTest :
    FunSpec({
        context("MemberDTO#toString") {
            test("should mask password") {
                val input =
                    UpdateContestInputDTO.MemberDTO(
                        id = null,
                        type = Member.Type.ROOT,
                        name = "Test User",
                        login = "testUser",
                        password = "testPassword",
                    )
                val expected = "MemberDTO(id=null, type=ROOT, name='Test User', login='testUser', password='******')"

                input.toString() shouldBe expected
            }
        }

        context("validation") {
            val inputDTO =
                UpdateContestInputDTO(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                    settings = UpdateContestInputDTO.SettingsDTO(isAutoJudgeEnabled = true),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = UuidCreator.getTimeOrderedEpoch(),
                                type = Member.Type.CONTESTANT,
                                name = "Test User",
                                login = "test_user",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = UuidCreator.getTimeOrderedEpoch(),
                                letter = 'A',
                                color = "#ffffff",
                                title = "Test Problem",
                                description = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                                timeLimit = 1000,
                                memoryLimit = 256,
                                testCases = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                            ),
                        ),
                )

            val validator = Validation.buildDefaultValidatorFactory().validator

            listOf(
                inputDTO.copy(slug = ""),
                inputDTO.copy(slug = "invalid slug"),
                inputDTO.copy(slug = "a".repeat(33)),
                inputDTO.copy(title = ""),
                inputDTO.copy(slug = "a".repeat(256)),
                inputDTO.copy(languages = emptyList()),
                inputDTO.copy(endAt = OffsetDateTime.now().minusHours(1)),
                inputDTO.copy(startAt = OffsetDateTime.now().plusHours(2), endAt = OffsetDateTime.now().plusHours(1)),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(name = ""))),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(name = "a".repeat(65)))),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(login = ""))),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(login = "a".repeat(33)))),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(id = null, password = ""))),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(password = "a".repeat(33)))),
                inputDTO.copy(members = listOf(inputDTO.members[0].copy(login = "login"), inputDTO.members[0].copy(login = "login"))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(color = ""))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(color = "ffffff"))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(color = "#fff"))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(color = "any"))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(title = ""))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(title = "a".repeat(256)))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(timeLimit = 0))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(memoryLimit = 0))),
                inputDTO.copy(problems = listOf(inputDTO.problems[0].copy(letter = 'A'), inputDTO.problems[0].copy(letter = 'A'))),
            ).forEachIndexed { idx, invalidInputDTO ->
                test("should throw validation exception for invalid input #$idx") {
                    val violations = validator.validate(invalidInputDTO)
                    violations.isNotEmpty() shouldBe true
                }
            }
        }
    })
