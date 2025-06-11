package io.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.api.dto.response.contest.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.contest.toMetadataDTO
import io.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.leonfoliveira.judge.api.util.SecurityContextMockFactory
import io.leonfoliveira.judge.config.ControllerTest
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.service.contest.CreateContestService
import io.leonfoliveira.judge.core.service.contest.DeleteContestService
import io.leonfoliveira.judge.core.service.contest.FindContestService
import io.leonfoliveira.judge.core.service.contest.UpdateContestService
import io.leonfoliveira.judge.core.dto.input.contest.CreateContestInputDTOMockFactory
import io.leonfoliveira.judge.core.dto.input.contest.UpdateContestInputDTOMockFactory
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
import java.time.OffsetDateTime
import java.util.UUID

@ControllerTest([ContestController::class])
class ContestControllerTest(
    val mockMvc: MockMvc,
    val objectMapper: ObjectMapper,
    @MockkBean val createContestService: CreateContestService,
    @MockkBean val updateContestService: UpdateContestService,
    @MockkBean val findContestService: FindContestService,
    @MockkBean val deleteContestService: DeleteContestService,
    @MockkBean val findSubmissionService: FindSubmissionService,
) : FunSpec({
        beforeEach {
            mockkStatic(SecurityContextHolder::class)
            every { SecurityContextHolder.getContext() }
                .returns(SecurityContextMockFactory.buildRoot())
        }

        context("Root") {
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
                        content { contest.toFullResponseDTO() }
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
                        content { contest.toFullResponseDTO() }
                    }
            }

            test("findAllContestMetadata") {
                val contests = listOf(ContestMockFactory.build())
                every { findContestService.findAll() }
                    .returns(contests)

                mockMvc.get("$basePath/metadata")
                    .andExpect {
                        status { isOk() }
                        content { contests.map { it.toMetadataDTO() } }
                    }
            }

            test("findFullContestById") {
                val contest =
                    ContestMockFactory.build(
                        members = listOf(MemberMockFactory.build()),
                        problems = listOf(ProblemMockFactory.build()),
                    )
                every { findContestService.findById(contest.id) }
                    .returns(contest)

                mockMvc.get("$basePath/${contest.id}/full")
                    .andExpect {
                        status { isOk() }
                        content { contest }
                    }
            }

            test("deleteContest") {
                val contestId = UUID.randomUUID()
                every { deleteContestService.delete(contestId) }
                    .returns(Unit)

                mockMvc.delete("$basePath/$contestId")
                    .andExpect {
                        status { isNoContent() }
                    }
            }

            test("findAllContestSubmissions") {
                val contestId = UUID.randomUUID()
                val submissions = listOf(SubmissionMockFactory.build())
                every { findSubmissionService.findAllByContest(contestId) }
                    .returns(submissions)

                mockMvc.get("$basePath/$contestId/submissions")
                    .andExpect {
                        status { isOk() }
                        content { submissions.map { it.toPublicResponseDTO() } }
                    }
            }
        }

        context("Public") {
            val basePath = "/v1/contests"

            test("findContestById") {
                val contest =
                    ContestMockFactory.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                    )
                every { findContestService.findById(contest.id) }
                    .returns(contest)

                mockMvc.get("$basePath/${contest.id}")
                    .andExpect {
                        status { isOk() }
                        content { contest }
                    }
            }

            test("findContestMetadataBySlug") {
                val contest = ContestMockFactory.build()
                every { findContestService.findBySlug(contest.slug) }
                    .returns(contest)

                mockMvc.get("$basePath/slug/${contest.slug}/metadata")
                    .andExpect {
                        status { isOk() }
                        content { contest.toMetadataDTO() }
                    }
            }
        }

        context("Jury") {
            val basePath = "/v1/contests"

            beforeEach {
                every { SecurityContextHolder.getContext() }
                    .returns(SecurityContextMockFactory.buildJury())
            }

            test("findAllContestFullSubmissions") {
                val contestId = UUID.randomUUID()
                val submissions = listOf(SubmissionMockFactory.build())
                every { findSubmissionService.findAllByContest(contestId) }
                    .returns(submissions)

                mockMvc.get("$basePath/$contestId/submissions/full")
                    .andExpect {
                        status { isOk() }
                        content { submissions.map { it.toFullResponseDTO() } }
                    }
            }
        }
    })
