package io.github.leonfoliveira.forseti.api.controller.contest

import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.api.controller.advice.GlobalExceptionHandler
import io.github.leonfoliveira.forseti.api.util.ContestAuthFilter
import io.github.leonfoliveira.forseti.common.config.JacksonConfig
import io.github.leonfoliveira.forseti.common.service.dto.output.LeaderboardOutputDTO
import io.github.leonfoliveira.forseti.common.service.leaderboard.FindLeaderboardService
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.time.OffsetDateTime
import java.util.UUID

@WebMvcTest(controllers = [ContestLeaderboardController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestLeaderboardController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestLeaderboardControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val findLeaderboardService: FindLeaderboardService,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/leaderboard"

        test("findContestLeaderboardById") {
            val contestId = UUID.randomUUID()
            val leaderboard =
                LeaderboardOutputDTO(
                    contestId = contestId,
                    slug = "test-contest",
                    startAt = OffsetDateTime.now(),
                    members = emptyList(),
                    issuedAt = OffsetDateTime.now(),
                )
            every { findLeaderboardService.findByContestId(contestId) } returns leaderboard

            webMvc
                .get(basePath, contestId) {
                    accept = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { leaderboard }
                }
        }
    })
