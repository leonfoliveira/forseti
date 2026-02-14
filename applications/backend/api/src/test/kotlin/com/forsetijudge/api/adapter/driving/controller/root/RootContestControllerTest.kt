package com.forsetijudge.api.adapter.driving.controller.root

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.api.adapter.dto.response.contest.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.contest.toMetadataDTO
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driving.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.driving.usecase.contest.FindContestUseCase
import com.forsetijudge.core.port.dto.input.contest.CreateContestInputDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
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
    private val findContestUseCase: FindContestUseCase,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
        extensions(SpringExtension)

        beforeTest {
            objectMapper.enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        }

        val basePath = "/api/v1/root/contests"

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
    })
