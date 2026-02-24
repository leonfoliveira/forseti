package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.driving.advice.GlobalExceptionHandler
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.UnfreezeLeaderboardUseCase
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
import org.springframework.test.web.servlet.put

@WebMvcTest(controllers = [ContestLeaderboardController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestLeaderboardController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestLeaderboardTest(
    @MockkBean(relaxed = true)
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
    @MockkBean(relaxed = true)
    private val unfreezeLeaderboardUseCase: UnfreezeLeaderboardUseCase,
    private val webMvc: MockMvc,
) : FunSpec({
        extensions(SpringExtension)

        val basePath = "/v1/contests/{contestId}/leaderboard"
        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("freeze") {
            val contestId = IdGenerator.getUUID()
            val contest = ContestMockBuilder.build()
            every {
                freezeLeaderboardUseCase.execute()
            } returns contest

            webMvc
                .put("$basePath:freeze", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toWithMembersAndProblemsResponseBodyDTO() }
                }

            verify {
                freezeLeaderboardUseCase.execute()
            }
        }

        test("unfreeze") {
            val contestId = IdGenerator.getUUID()
            val contest = ContestMockBuilder.build()
            every {
                unfreezeLeaderboardUseCase.execute()
            } returns contest

            webMvc
                .put("$basePath:unfreeze", contestId) {
                    contentType = MediaType.APPLICATION_JSON
                }.andExpect {
                    status { isOk() }
                    content { contest.toWithMembersAndProblemsResponseBodyDTO() }
                }

            verify {
                unfreezeLeaderboardUseCase.execute()
            }
        }
    })
