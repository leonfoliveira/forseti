package com.forsetijudge.api.adapter.driving.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.api.adapter.dto.response.contest.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.toMetadataDTO
import com.forsetijudge.api.adapter.dto.response.contest.toPublicOutputDTO
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import com.forsetijudge.core.port.driving.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.driving.usecase.contest.DeleteContestUseCase
import com.forsetijudge.core.port.driving.usecase.contest.FindContestUseCase
import com.forsetijudge.core.port.driving.usecase.contest.UpdateContestUseCase
import com.forsetijudge.core.port.dto.input.attachment.AttachmentInputDTO
import com.forsetijudge.core.port.dto.input.contest.CreateContestInputDTO
import com.forsetijudge.core.port.dto.input.contest.UpdateContestInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import java.time.OffsetDateTime

@WebMvcTest(controllers = [ContestController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestControllerTest(
    @MockkBean(relaxed = true)
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    @MockkBean(relaxed = true)
    private val createContestUseCase: CreateContestUseCase,
    @MockkBean(relaxed = true)
    private val updateContestUseCase: UpdateContestUseCase,
    @MockkBean(relaxed = true)
    private val findContestUseCase: FindContestUseCase,
    @MockkBean(relaxed = true)
    private val deleteContestUseCase: DeleteContestUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        beforeTest {
            objectMapper.enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        }

        val basePath = "/api/v1/contests"

        test("createContest") {
            val body =
                CreateContestInputDTO(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                )
            val contest = ContestMockBuilder.build()
            every { createContestUseCase.create(body) } returns contest

            webMvc
                .post(basePath) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("updateContest") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val body =
                UpdateContestInputDTO(
                    slug = "updated-contest",
                    title = "Updated Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                    settings =
                        UpdateContestInputDTO.SettingsDTO(
                            isAutoJudgeEnabled = false,
                        ),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = UuidCreator.getTimeOrderedEpoch(),
                                type = Member.Type.CONTESTANT,
                                name = "Updated Member",
                                login = "updated_member",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = UuidCreator.getTimeOrderedEpoch(),
                                letter = 'B',
                                title = "Problem B",
                                description = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                                timeLimit = 2000,
                                memoryLimit = 1024,
                                testCases = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                            ),
                        ),
                )
            val contest = ContestMockBuilder.build()
            every { updateContestUseCase.update(contestId, body) } returns contest

            webMvc
                .put("$basePath/{contestId}", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("findAllContestMetadata") {
            val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
            every { findContestUseCase.findAll() } returns contests

            webMvc
                .get("$basePath/metadata") {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contests.map { it.toMetadataDTO() } }
                }
        }

        test("findContestMetadataBySlug") {
            val slug = "test-contest"
            val contest = ContestMockBuilder.build(slug = slug)
            every { findContestUseCase.findBySlug(slug) } returns contest

            webMvc
                .get("$basePath/slug/{slug}/metadata", slug) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toMetadataDTO() }
                }
        }

        test("findContestById") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1))
            every { findContestUseCase.findById(contestId) } returns contest

            webMvc
                .get("$basePath/{contestId}", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toPublicOutputDTO() }
                }
        }

        test("findFullContestById") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val contest =
                ContestMockBuilder.build(
                    id = contestId,
                    members = listOf(MemberMockBuilder.build()),
                    problems =
                        listOf(
                            ProblemMockBuilder.build(),
                        ),
                )
            every { findContestUseCase.findById(contestId) } returns contest

            webMvc
                .get("$basePath/{contestId}/full", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("forceStartContest") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val contest = ContestMockBuilder.build(id = contestId)
            every { updateContestUseCase.forceStart(contestId) } returns contest

            webMvc
                .put("$basePath/{contestId}:force-start", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toMetadataDTO() }
                }
        }

        test("forceEndContest") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val contest = ContestMockBuilder.build(id = contestId)
            every { updateContestUseCase.forceEnd(contestId) } returns contest

            webMvc
                .put("$basePath/{contestId}:force-end", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toMetadataDTO() }
                }
        }

        test("deleteContest") {
            val contestId = UuidCreator.getTimeOrderedEpoch()

            webMvc
                .delete("$basePath/{contestId}", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { deleteContestUseCase.delete(contestId) }
        }
    })
