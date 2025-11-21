package live.forseti.api.adapter.driving.controller.contest

import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import live.forseti.api.adapter.driving.controller.advice.GlobalExceptionHandler
import live.forseti.core.config.JacksonConfig
import live.forseti.core.port.driving.usecase.contest.AuthorizeContestUseCase
import live.forseti.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import live.forseti.core.port.dto.output.LeaderboardOutputDTO
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
    private val authorizeContestUseCase: AuthorizeContestUseCase,
    @MockkBean(relaxed = true)
    private val findLeaderboardUseCase: BuildLeaderboardUseCase,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/leaderboard"

        test("findContestLeaderboardById") {
            val contestId = UUID.randomUUID()
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
