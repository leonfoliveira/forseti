package io.github.leonfoliveira.judge.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.api.controller.advice.GlobalExceptionHandler
import io.github.leonfoliveira.judge.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toMetadataDTO
import io.github.leonfoliveira.judge.api.dto.response.contest.toPublicOutputDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.config.JacksonConfig
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.mock.entity.AnnouncementMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ClarificationMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.announcement.CreateAnnouncementService
import io.github.leonfoliveira.judge.common.service.clarification.CreateClarificationService
import io.github.leonfoliveira.judge.common.service.contest.CreateContestService
import io.github.leonfoliveira.judge.common.service.contest.DeleteContestService
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import io.github.leonfoliveira.judge.common.service.contest.UpdateContestService
import io.github.leonfoliveira.judge.common.service.dto.input.announcement.CreateAnnouncementInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.clarification.CreateClarificationInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.UpdateContestInputDTO
import io.github.leonfoliveira.judge.common.service.dto.output.ContestLeaderboardOutputDTO
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@WebMvcTest(controllers = [ContestController::class])
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = [ContestController::class, JacksonConfig::class, GlobalExceptionHandler::class])
class ContestControllerTest(
    @MockkBean(relaxed = true)
    private val contestAuthFilter: ContestAuthFilter,
    @MockkBean(relaxed = true)
    private val createContestService: CreateContestService,
    @MockkBean(relaxed = true)
    private val updateContestService: UpdateContestService,
    @MockkBean(relaxed = true)
    private val findContestService: FindContestService,
    @MockkBean(relaxed = true)
    private val deleteContestService: DeleteContestService,
    @MockkBean(relaxed = true)
    private val findSubmissionService: FindSubmissionService,
    @MockkBean(relaxed = true)
    private val createAnnouncementService: CreateAnnouncementService,
    @MockkBean(relaxed = true)
    private val createClarificationService: CreateClarificationService,
    private val webMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) : FunSpec({
    extensions(SpringExtension)

    test("createContest") {
        val body = CreateContestInputDTO(
            slug = "test-contest",
            title = "Test Contest",
            languages = listOf(Language.PYTHON_3_13_3),
            startAt = OffsetDateTime.now().plusHours(1),
            endAt = OffsetDateTime.now().plusHours(2),
            members = listOf(
                CreateContestInputDTO.MemberDTO(
                    type = Member.Type.CONTESTANT,
                    name = "Member",
                    login = "member",
                    password = "password123"
                )
            ),
            problems = listOf(
                CreateContestInputDTO.ProblemDTO(
                    letter = 'A',
                    title = "Problem A",
                    description = AttachmentInputDTO(id = UUID.randomUUID()),
                    timeLimit = 1000,
                    memoryLimit = 512,
                    testCases = AttachmentInputDTO(id = UUID.randomUUID())
                )
            )
        )
        val contest = ContestMockBuilder.build()
        every { createContestService.create(body) } returns contest

        val str = objectMapper.writeValueAsString(body)
        println("Request body: $str")

        webMvc.post("/v1/contests") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isOk() }
            content { contest.toFullResponseDTO() }
        }
    }

    test("updateContest") {
        val contestId = UUID.randomUUID()
        val body = UpdateContestInputDTO(
            id = UUID.randomUUID(),
            slug = "updated-contest",
            title = "Updated Contest",
            languages = listOf(Language.PYTHON_3_13_3),
            startAt = OffsetDateTime.now().plusHours(1),
            endAt = OffsetDateTime.now().plusHours(2),
            members = listOf(
                UpdateContestInputDTO.MemberDTO(
                    id = UUID.randomUUID(),
                    type = Member.Type.CONTESTANT,
                    name = "Updated Member",
                    login = "updated_member",
                    password = "password123"
                )
            ),
            problems = listOf(
                UpdateContestInputDTO.ProblemDTO(
                    id = UUID.randomUUID(),
                    letter = 'B',
                    title = "Problem B",
                    description = AttachmentInputDTO(id = UUID.randomUUID()),
                    timeLimit = 2000,
                    memoryLimit = 1024,
                    testCases = AttachmentInputDTO(id = UUID.randomUUID())
                )
            )
        )
        val contest = ContestMockBuilder.build()
        every { updateContestService.update(body) } returns contest

        webMvc.put("/v1/contests", contestId) {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isOk() }
            content { contest.toFullResponseDTO() }
        }
    }

    test("findAllContestMetadata") {
        val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
        every { findContestService.findAll() } returns contests

        webMvc.get("/v1/contests/metadata") {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contests.map { it.toMetadataDTO() } }
        }
    }

    test("findContestMetadataBySlug") {
        val slug = "test-contest"
        val contest = ContestMockBuilder.build(slug = slug)
        every { findContestService.findBySlug(slug) } returns contest

        webMvc.get("/v1/contests/slug/{slug}/metadata", slug) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contest.toMetadataDTO() }
        }
    }

    test("findContestById - notStarted") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))
        every { findContestService.findById(contestId) } returns contest

        webMvc.get("/v1/contests/{id}", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isForbidden() }
        }
    }

    test("findContestById") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1))
        every { findContestService.findById(contestId) } returns contest

        webMvc.get("/v1/contests/{id}", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contest.toPublicOutputDTO() }
        }
    }

    test("findFullContestById") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId)
        every { findContestService.findById(contestId) } returns contest

        webMvc.get("/v1/contests/{id}/full", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contest.toFullResponseDTO() }
        }
    }

    test("findContestLeaderboardById - notStarted") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))
        every { findContestService.findById(contestId) } returns contest

        webMvc.get("/v1/contests/{id}/leaderboard", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isForbidden() }
        }
    }

    test("findContestLeaderboardById") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1))
        every { findContestService.findById(contestId) } returns contest
        val leaderboard = mockk<ContestLeaderboardOutputDTO>(relaxed = true)
        every { findContestService.buildContestLeaderboard(contest) } returns leaderboard

        webMvc.get("/v1/contests/{id}/leaderboard", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
        }
    }

    test("forceStartContest") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId)
        every { updateContestService.forceStart(contestId) } returns contest

        webMvc.put("/v1/contests/{id}/start", contestId) {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contest.toMetadataDTO() }
        }
    }

    test("forceEndContest") {
        val contestId = UUID.randomUUID()
        val contest = ContestMockBuilder.build(id = contestId)
        every { updateContestService.forceEnd(contestId) } returns contest

        webMvc.put("/v1/contests/{id}/end", contestId) {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { contest.toMetadataDTO() }
        }
    }

    test("deleteContest") {
        val contestId = UUID.randomUUID()

        webMvc.delete("/v1/contests/{id}", contestId) {
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isNoContent() }
        }

        verify { deleteContestService.delete(contestId) }
    }

    test("findAllContestSubmissions") {
        val contestId = UUID.randomUUID()
        val submissions = listOf(
            SubmissionMockBuilder.build(),
            SubmissionMockBuilder.build()
        )
        every { findSubmissionService.findAllByContest(contestId) } returns submissions

        webMvc.get("/v1/contests/{id}/submissions", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { submissions.map { it.toPublicResponseDTO() } }
        }
    }

    test("findAllContestFullSubmissions") {
        val contestId = UUID.randomUUID()
        val submissions = listOf(
            SubmissionMockBuilder.build(),
            SubmissionMockBuilder.build()
        )
        every { findSubmissionService.findAllByContest(contestId) } returns submissions

        webMvc.get("/v1/contests/{id}/submissions/full", contestId) {
            accept = MediaType.APPLICATION_JSON
        }.andExpect {
            status { isOk() }
            content { submissions.map { it.toFullResponseDTO() } }
        }

        verify { contestAuthFilter.check(contestId) }
    }

    test("createAnnouncement") {
        val contestId = UUID.randomUUID()
        val body = CreateAnnouncementInputDTO(
            text = "This is a test announcement",
        )
        val announcement = AnnouncementMockBuilder.build()
        val member = AuthorizationMockBuilder.buildMember()
        SecurityContextHolder.getContext().authentication = JwtAuthentication(member)
        every { createAnnouncementService.create(contestId, member.id, body) } returns announcement

        webMvc.post("/v1/contests/{id}/announcements", contestId) {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isOk() }
            content { announcement.toResponseDTO() }
        }

        verify { contestAuthFilter.check(contestId) }
    }

    test("createClarification") {
        val contestId = UUID.randomUUID()
        val body = CreateClarificationInputDTO(
            text = "This is a test clarification",
        )
        val clarification = ClarificationMockBuilder.build()
        val member = AuthorizationMockBuilder.buildMember()
        SecurityContextHolder.getContext().authentication = JwtAuthentication(member)
        every { createClarificationService.create(contestId, member.id, body) } returns clarification

        webMvc.post("/v1/contests/{id}/clarifications", contestId) {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isOk() }
            content { clarification.toResponseDTO() }
        }

        verify { contestAuthFilter.check(contestId) }
    }
})
