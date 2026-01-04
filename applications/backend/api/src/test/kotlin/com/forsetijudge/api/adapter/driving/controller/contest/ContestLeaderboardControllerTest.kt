package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.contest.AuthorizeContestUseCase
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import com.github.f4b6a3.uuid.UuidCreator
import com.ninjasquad.springmockk.MockkBean
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

@WebMvcTest(controllers = [ContestLeaderboardController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestLeaderboardController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestLeaderboardControllerTest(
    @MockkBean(relaxed = true)
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    @MockkBean(relaxed = true)
    private val findLeaderboardUseCase: BuildLeaderboardUseCase,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/api/v1/contests/{contestId}/leaderboard"

        test("findContestLeaderboardById") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val leaderboard = mockk<LeaderboardOutputDTO>(relaxed = true)
            every { findLeaderboardUseCase.build(contestId) } returns leaderboard

            webMvc
                .get(basePath, contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { leaderboard }
                }
        }
    })
