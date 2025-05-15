package io.leonfoliveira.judge.api.controller
import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.controller.dto.CreateContestRequestDTOMockFactory
import io.leonfoliveira.judge.api.controller.dto.UpdateContestRequestDTOMockFactory
import io.leonfoliveira.judge.api.controller.dto.response.toFullResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.contest.CreateContestService
import io.leonfoliveira.judge.core.service.contest.DeleteContestService
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.contest.UpdateContestService
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.output.ProblemMemberOutputDTOMockFactory
import io.leonfoliveira.judge.core.service.leaderboard.LeaderboardService
import io.leonfoliveira.judge.core.service.problem.FindProblemService
import io.leonfoliveira.judge.core.service.submission.FindSubmissionService
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@AutoConfigureMockMvc
@SpringBootTest
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
                content = objectMapper.writeValueAsString(CreateContestRequestDTOMockFactory.build())
            }
                .andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("updateContest") {
            val contest = ContestMockFactory.build()
            every { updateContestService.update(any()) }
                .returns(contest)

            mockMvc.put(basePath) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(UpdateContestRequestDTOMockFactory.build())
            }
                .andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("findAllContest") {
            val contests = listOf(ContestMockFactory.build())
            every { findContestService.findAll() }
                .returns(contests)

            mockMvc.get(basePath)
                .andExpect {
                    status { isOk() }
                    content { contests.map { it.toResponseDTO() } }
                }
        }

        test("findFullContestById") {
            val contest = ContestMockFactory.build()
            every { findContestService.findById(contest.id) }
                .returns(contest)

            mockMvc.get("$basePath/${contest.id}/full")
                .andExpect {
                    status { isOk() }
                    content { contest.toFullResponseDTO() }
                }
        }

        test("findContestById") {
            val contest = ContestMockFactory.build()
            every { findContestService.findById(contest.id) }
                .returns(contest)

            mockMvc.get("$basePath/${contest.id}")
                .andExpect {
                    status { isOk() }
                    content { contest.toResponseDTO() }
                }
        }

        test("deleteContest") {
            val contest = ContestMockFactory.build()
            every { deleteContestService.delete(contest.id) }
                .returns(Unit)

            mockMvc.delete("$basePath/${contest.id}")
                .andExpect {
                    status { isNoContent() }
                }
        }

        test("leaderboard") {
            val contest = ContestMockFactory.build()
            val leaderboard = LeaderboardOutputDTOMockFactory.build()
            every { leaderboardService.buildLeaderboard(contest.id) }
                .returns(leaderboard)

            mockMvc.get("$basePath/${contest.id}/leaderboard")
                .andExpect {
                    status { isOk() }
                    content { leaderboard }
                }
        }

        test("findAllProblems") {
            val contest = ContestMockFactory.build()
            val problems = listOf(ProblemMockFactory.build())
            every { findProblemService.findAllByContest(contest.id) }
                .returns(problems)

            mockMvc.get("$basePath/${contest.id}/problems")
                .andExpect {
                    status { isOk() }
                    content { problems.map { it.toResponseDTO() } }
                }
        }

        test("findAllProblemsForMember") {
            val contest = ContestMockFactory.build()
            val problems = listOf(ProblemMemberOutputDTOMockFactory.build())
            every { findProblemService.findAllByContestForMember(contest.id, any()) }
                .returns(problems)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildContestant())

            mockMvc.get("$basePath/${contest.id}/problems/me")
                .andExpect {
                    status { isOk() }
                    content { problems }
                }
        }

        test("findAllSubmissions") {
            val contest = ContestMockFactory.build()
            val submissions = listOf(SubmissionMockFactory.build())
            every { findSubmissionService.findAllByContest(contest.id) }
                .returns(submissions)

            mockMvc.get("$basePath/${contest.id}/submissions")
                .andExpect {
                    status { isOk() }
                    content { submissions.map { it.toResponseDTO() } }
                }
        }
    })
