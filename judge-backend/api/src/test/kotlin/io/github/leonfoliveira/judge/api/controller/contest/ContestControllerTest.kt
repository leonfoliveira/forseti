package io.github.leonfoliveira.judge.api.controller.contest

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.controller.advice.GlobalExceptionHandler
import io.github.leonfoliveira.judge.api.dto.response.contest.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toMetadataDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toPublicOutputDTO
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.config.JacksonConfig
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.service.contest.CreateContestService
import io.github.leonfoliveira.judge.common.service.contest.DeleteContestService
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import io.github.leonfoliveira.judge.common.service.contest.UpdateContestService
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.UpdateContestInputDTO
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
import java.util.UUID

@WebMvcTest(controllers = [ContestController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val createContestService: CreateContestService,
    @MockkBean(relaxed = true)
    private val updateContestService: UpdateContestService,
    @MockkBean(relaxed = true)
    private val findContestService: FindContestService,
    @MockkBean(relaxed = true)
    private val deleteContestService: DeleteContestService,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        beforeTest {
            objectMapper.enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        }

        val basePath = "/v1/contests"

        test("createContest") {
            val body =
                CreateContestInputDTO(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Language.PYTHON_3_12),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                )
            val contest = ContestMockBuilder.build()
            every { createContestService.create(body) } returns contest

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
            val contestId = UUID.randomUUID()
            val body =
                UpdateContestInputDTO(
                    id = UUID.randomUUID(),
                    slug = "updated-contest",
                    title = "Updated Contest",
                    languages = listOf(Language.PYTHON_3_12),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = UUID.randomUUID(),
                                type = Member.Type.CONTESTANT,
                                name = "Updated Member",
                                login = "updated_member",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = UUID.randomUUID(),
                                letter = 'B',
                                title = "Problem B",
                                description = AttachmentInputDTO(id = UUID.randomUUID()),
                                timeLimit = 2000,
                                memoryLimit = 1024,
                                testCases = AttachmentInputDTO(id = UUID.randomUUID()),
                            ),
                        ),
                )
            val contest = ContestMockBuilder.build()
            every { updateContestService.update(body) } returns contest

            webMvc
                .put(basePath, contestId) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("findAllContestMetadata") {
            val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
            every { findContestService.findAll() } returns contests

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
            every { findContestService.findBySlug(slug) } returns contest

            webMvc
                .get("$basePath/slug/{slug}/metadata", slug) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toMetadataDTO() }
                }
        }

        test("findContestById") {
            val contestId = UUID.randomUUID()
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1))
            every { findContestService.findById(contestId) } returns contest

            webMvc
                .get("$basePath/{contestId}", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toPublicOutputDTO() }
                }
        }

        test("findFullContestById") {
            val contestId = UUID.randomUUID()
            val contest =
                ContestMockBuilder.build(
                    id = contestId,
                    members = listOf(MemberMockBuilder.build()),
                    problems =
                        listOf(
                            ProblemMockBuilder.build(),
                        ),
                )
            every { findContestService.findById(contestId) } returns contest

            webMvc
                .get("$basePath/{contestId}/full", contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("forceStartContest") {
            val contestId = UUID.randomUUID()
            val contest = ContestMockBuilder.build(id = contestId)
            every { updateContestService.forceStart(contestId) } returns contest

            webMvc
                .put("$basePath/{contestId}/start", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toMetadataDTO() }
                }
        }

        test("forceEndContest") {
            val contestId = UUID.randomUUID()
            val contest = ContestMockBuilder.build(id = contestId)
            every { updateContestService.forceEnd(contestId) } returns contest

            webMvc
                .put("$basePath/{contestId}/end", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toMetadataDTO() }
                }
        }

        test("deleteContest") {
            val contestId = UUID.randomUUID()

            webMvc
                .delete("$basePath/{contestId}", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify { deleteContestService.delete(contestId) }
        }
    })
