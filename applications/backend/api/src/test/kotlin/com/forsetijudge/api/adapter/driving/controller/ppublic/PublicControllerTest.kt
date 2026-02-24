package com.forsetijudge.api.adapter.driving.controller.ppublic

import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.contest.FindContestBySlugUseCase
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
import org.springframework.test.web.servlet.get

@WebMvcTest(controllers = [PublicContestController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [PublicContestController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class PublicControllerTest(
    @MockkBean(relaxed = true)
    private val findContestBySlugUseCase: FindContestBySlugUseCase,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/public/contests"
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
    })
