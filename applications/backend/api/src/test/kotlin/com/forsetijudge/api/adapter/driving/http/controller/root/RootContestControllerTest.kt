package com.forsetijudge.api.adapter.driving.http.controller.root

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.forsetijudge.api.adapter.driving.http.advice.GlobalExceptionHandler
import com.forsetijudge.api.adapter.dto.request.contest.CreateContestRequestBodyDTO
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.contest.CreateContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.DeleteContestUseCase
import com.forsetijudge.core.port.driving.usecase.external.contest.FindAllContestUseCase
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
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
import org.springframework.test.web.servlet.post
import java.time.OffsetDateTime

@WebMvcTest(controllers = [RootContestController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [RootContestController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class RootContestControllerTest(
    @MockkBean(relaxed = true)
    private val createContestUseCase: CreateContestUseCase,
    @MockkBean(relaxed = true)
    private val findAllContestUseCase: FindAllContestUseCase,
    @MockkBean(relaxed = true)
    private val deleteContestUseCase: DeleteContestUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        beforeTest {
            objectMapper.enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        }

        val basePath = "/v1/root/contests"
        val memberId = Member.ROOT_ID

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(null, memberId)
        }

        test("create") {
            val body =
                CreateContestRequestBodyDTO(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                )
            val command =
                CreateContestUseCase.Command(
                    slug = body.slug,
                    title = body.title,
                    languages = body.languages,
                    startAt = body.startAt,
                    endAt = body.endAt,
                )
            val contest = ContestMockBuilder.build()
            every { createContestUseCase.execute(command) } returns contest

            webMvc
                .post(basePath) {
                    contentType = MediaType.APPLICATION_JSON
                    content = objectMapper.writeValueAsString(body)
                }.andExpect {
                    status { isOk() }
                    content { contest.toResponseBodyDTO() }
                }
        }

        test("findAll") {
            val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
            every { findAllContestUseCase.execute() } returns contests

            webMvc
                .get(basePath) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contests.map { it.toResponseBodyDTO() } }
                }

            verify { findAllContestUseCase.execute() }
        }

        test("delete") {
            val contestId = IdGenerator.getUUID()

            webMvc
                .delete("$basePath/{contestId}", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isNoContent() }
                }

            verify {
                deleteContestUseCase.execute()
            }
        }
    })
