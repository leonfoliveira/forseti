package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.config.security.CorsConfig
import io.leonfoliveira.judge.api.config.security.WebSecurityConfig
import io.leonfoliveira.judge.api.controller.dto.response.toPrivateResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toPublicResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.service.contest.CreateContestService
import io.leonfoliveira.judge.core.service.contest.DeleteContestService
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.contest.UpdateContestService
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.output.ProblemWithStatusOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.leaderboard.LeaderboardService
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@ControllerTest([ContestController::class])
class ContestControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean val createContestService: CreateContestService,
    @MockkBean val updateContestService: UpdateContestService,
    @MockkBean val findContestService: FindContestService,
    @MockkBean val deleteContestService: DeleteContestService,
    @MockkBean val leaderboardService: LeaderboardService,
    @MockkBean val findProblemService: FindProblemService,
    @MockkBean val findSubmissionService: FindSubmissionService,
) : FunSpec({
        beforeEach {
            mockkStatic(SecurityContextHolder::class)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildRoot())
        }

        val basePath = "/v1/contests"

        test("createContest") {
            val contest = ContestMockFactory.build()
            every { createContestService.create(any()) }
                .returns(contest)

            mockMvc.post(basePath) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(CreateContestInputDTOMockFactory.build())
            }
                .andExpect {
                    status { isOk() }
                    content { contest.toPrivateResponseDTO() }
                }
        }

        test("updateContest") {
            val contest = ContestMockFactory.build()
            every { updateContestService.update(any()) }
                .returns(contest)

            mockMvc.put(basePath) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(UpdateContestInputDTOMockFactory.build())
            }
                .andExpect {
                    status { isOk() }
                    content { contest.toPrivateResponseDTO() }
                }
        }

        test("findAllContest") {
            val contests = listOf(ContestMockFactory.build())
            every { findContestService.findAll() }
                .returns(contests)

            mockMvc.get(basePath)
                .andExpect {
                    status { isOk() }
                    content { contests.map { it.toPublicResponseDTO() } }
                }
        }

        test("findContestByIdForRoot") {
            val contest = ContestMockFactory.build()
            every { findContestService.findById(contest.id) }
                .returns(contest)

            mockMvc.get("$basePath/${contest.id}/root")
                .andExpect {
                    status { isOk() }
                    content { contest }
                }
        }

        test("findContestById") {
            val contest = ContestMockFactory.build()
            every { findContestService.findById(contest.id) }
                .returns(contest)

            mockMvc.get("$basePath/${contest.id}")
                .andExpect {
                    status { isOk() }
                    content { contest.toPublicResponseDTO() }
                }
        }

        test("deleteContest") {
            val contestId = 1
            every { deleteContestService.delete(contestId) }
                .returns(Unit)

            mockMvc.delete("$basePath/$contestId")
                .andExpect {
                    status { isNoContent() }
                }
        }

        test("leaderboard") {
            val contestId = 1
            val leaderboard = LeaderboardOutputDTOMockFactory.build()
            every { leaderboardService.buildLeaderboard(contestId) }
                .returns(leaderboard)

            mockMvc.get("$basePath/$contestId/leaderboard")
                .andExpect {
                    status { isOk() }
                    content { leaderboard }
                }
        }

        test("findAllProblems") {
            val contestId = 1
            val problems = listOf(ProblemMockFactory.build())
            every { findProblemService.findAllByContest(contestId) }
                .returns(problems)

            mockMvc.get("$basePath/$contestId/problems")
                .andExpect {
                    status { isOk() }
                    content { problems.map { it.toPublicResponseDTO() } }
                }
        }

        test("findAllProblemsForMember") {
            val contestId = 1
            val problems = listOf(ProblemWithStatusOutputDTOMockFactory.build())
            every { findProblemService.findAllByContestForMember(contestId, any()) }
                .returns(problems)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())

            mockMvc.get("$basePath/$contestId/problems/me")
                .andExpect {
                    status { isOk() }
                    content { problems.map { it.toResponseDTO() } }
                }
        }

        test("findAllSubmissions") {
            val contestId = 1
            val submissions = listOf(SubmissionMockFactory.build())
            every { findSubmissionService.findAllByContest(contestId) }
                .returns(submissions)

            mockMvc.get("$basePath/$contestId/submissions")
                .andExpect {
                    status { isOk() }
                    content { submissions.map { it.toPublicResponseDTO() } }
                }
        }
    })
