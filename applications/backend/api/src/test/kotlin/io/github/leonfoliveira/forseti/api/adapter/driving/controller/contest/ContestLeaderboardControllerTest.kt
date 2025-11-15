package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.adapter.driving.controller.advice.GlobalExceptionHandler
import io.github.leonfoliveira.forseti.api.adapter.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.adapter.config.JacksonConfig
import io.github.leonfoliveira.forseti.common.application.dto.output.LeaderboardOutputDTO
import io.github.leonfoliveira.forseti.common.application.port.driving.FindLeaderboardUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.util.UUID

@WebMvcTest(controllers = [ContestLeaderboardController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestLeaderboardController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestLeaderboardControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val findLeaderboardUseCase: FindLeaderboardUseCase,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/leaderboard"

        test("findContestLeaderboardById") {
            val contestId = UUID.randomUUID()
            val leaderboard = mockk<LeaderboardOutputDTO>(relaxed = true)
            every { findLeaderboardUseCase.findByContestId(contestId) } returns leaderboard

            webMvc
                .get(basePath, contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { leaderboard }
                }
        }
    })
