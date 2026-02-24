package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.api.adapter.dto.request.attachment.AttachmentRequestBodyDTO
import com.forsetijudge.api.adapter.dto.request.contest.UpdateContestRequestBodyDTO
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.contest.DeleteContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.ForceStartContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.UpdateContestUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.put
import java.time.OffsetDateTime

@WebMvcTest(controllers = [ContestController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestControllerTest(
    @MockkBean(relaxed = true)
    private val findContestBySlugUseCase: FindContestBySlugUseCase,
    @MockkBean(relaxed = true)
    private val updateContestUseCase: UpdateContestUseCase,
    @MockkBean(relaxed = true)
    private val forceStartContestUseCase: ForceStartContestUseCase,
    @MockkBean(relaxed = true)
    private val forceEndContestUseCase: ForceEndContestUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("findBySlug") {
            val contest = ContestMockBuilder.build()
            val command = FindContestBySlugUseCase.Command(slug = contest.slug)
            every { findContestBySlugUseCase.execute(command) } returns contest

            webMvc
                .get("$basePath/slug/{slug}", contest.slug) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                }

            verify { findContestBySlugUseCase.execute(command) }
        }

        test("update") {
            val body =
                UpdateContestRequestBodyDTO(
                    slug = "updated-contest",
                    title = "Updated Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                    settings =
                        UpdateContestRequestBodyDTO.Settings(
                            isAutoJudgeEnabled = false,
                        ),
                    members =
                        listOf(
                            UpdateContestRequestBodyDTO.Member(
                                id = IdGenerator.getUUID(),
                                type = Member.Type.CONTESTANT,
                                name = "Updated Member",
                                login = "updated_member",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestRequestBodyDTO.Problem(
                                id = IdGenerator.getUUID(),
                                letter = 'B',
                                color = "#ffffff",
                                title = "Problem B",
                                description = AttachmentRequestBodyDTO(id = IdGenerator.getUUID()),
                                timeLimit = 2000,
                                memoryLimit = 1024,
                                testCases = AttachmentRequestBodyDTO(id = IdGenerator.getUUID()),
                            ),
                        ),
                )
            val contest = ContestMockBuilder.build()
            val command =
                UpdateContestUseCase.Command(
                    slug = body.slug,
                    title = body.title,
                    languages = body.languages,
                    startAt = body.startAt,
                    endAt = body.endAt,
                    autoFreezeAt = body.autoFreezeAt,
                    settings =
                        UpdateContestUseCase.Command.Settings(
                            isAutoJudgeEnabled = body.settings.isAutoJudgeEnabled,
                        ),
                    members =
                        body.members.map {
                            UpdateContestUseCase.Command.Member(
                                id = it.id,
                                type = it.type,
                                name = it.name,
                                login = it.login,
                                password = it.password,
                            )
                        },
                    problems =
                        body.problems.map {
                            UpdateContestUseCase.Command.Problem(
                                id = it.id,
                                letter = it.letter,
                                color = it.color,
                                title = it.title,
                                description =
                                    AttachmentCommandDTO(
                                        id = it.description.id,
                                    ),
                                timeLimit = it.timeLimit,
                                memoryLimit = it.memoryLimit,
                                testCases =
                                    AttachmentCommandDTO(
                                        id = it.testCases.id,
                                    ),
                            )
                        },
                )
            every {
                updateContestUseCase.execute(
                    command,
                )
            } returns contest

            webMvc
                .put("$basePath/{contestId}", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                }
        }

        test("forceStart") {
            val contestId = IdGenerator.getUUID()
            val contest = ContestMockBuilder.build()
            every {
                forceStartContestUseCase.execute()
            } returns contest

            webMvc
                .put("$basePath/{contestId}:force-start", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toWithMembersAndProblemsResponseBodyDTO() }
                }

            verify {
                forceStartContestUseCase.execute()
            }
        }

        test("forceEnd") {
            val contestId = IdGenerator.getUUID()
            val contest = ContestMockBuilder.build()
            every {
                forceEndContestUseCase.execute()
            } returns contest

            webMvc
                .put("$basePath/{contestId}:force-end", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toWithMembersAndProblemsResponseBodyDTO() }
                }

            verify {
                forceEndContestUseCase.execute()
            }
        }
    })
