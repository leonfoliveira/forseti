package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.SpectatorDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.StaffDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseDTO
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import tools.jackson.databind.DeserializationFeature
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.module.SimpleModule
import tools.jackson.module.kotlin.KotlinModule

internal object MockMvcTestSupport {
    private val messageConverter =
        JacksonJsonHttpMessageConverter(
            JsonMapper
                .builder()
                .addModules(
                    KotlinModule.Builder().build(),
                    SimpleModule().addSerializer(OffsetDateTime::class.java, JacksonConfig.OffsetDateTimeSerializer()),
                ).disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build(),
        )

    fun mvc(controller: Any): MockMvc =
        MockMvcBuilders
            .standaloneSetup(controller)
            .setMessageConverters(messageConverter)
            .build()

    fun contestResponse(id: UUID = UUID.randomUUID()) =
        ContestResponseDTO(
            id = id,
            createdAt = timestamp,
            updatedAt = timestamp,
            slug = "sample-contest",
            title = "Sample contest",
            languages = listOf(Submission.Language.CPP_17),
            startAt = timestamp.plusHours(1),
            endAt = timestamp.plusHours(2),
            isFrozen = false,
            version = 1,
        )

    fun contestWithDetailsResponse(id: UUID = UUID.randomUUID()) =
        ContestWithMembersAndProblemsResponseDTO(
            id = id,
            createdAt = timestamp,
            updatedAt = timestamp,
            slug = "sample-contest",
            title = "Sample contest",
            languages = listOf(Submission.Language.CPP_17),
            startAt = timestamp.plusHours(1),
            endAt = timestamp.plusHours(2),
            members = emptyList(),
            problems = emptyList(),
            version = 1,
        )

    fun adminDashboardResponse(id: UUID = UUID.randomUUID()) =
        AdminDashboardResponseDTO(
            contest = contestWithDetailsResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
            clarifications = emptyList(),
        )

    fun contestantDashboardResponse(id: UUID = UUID.randomUUID()) =
        ContestantDashboardResponseDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            memberSubmissions = emptyList(),
            announcements = emptyList(),
            clarifications = emptyList(),
        )

    fun spectatorDashboardResponse(id: UUID = UUID.randomUUID()) =
        SpectatorDashboardResponseDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
            clarifications = emptyList(),
        )

    fun judgeDashboardResponse(id: UUID = UUID.randomUUID()) =
        JudgeDashboardResponseDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
            clarifications = emptyList(),
        )

    fun staffDashboardResponse(id: UUID = UUID.randomUUID()) =
        StaffDashboardResponseDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
            clarifications = emptyList(),
        )

    fun submissionResponse(
        id: UUID = UUID.randomUUID(),
        contestId: UUID = UUID.randomUUID(),
        memberId: UUID = UUID.randomUUID(),
        problemId: UUID = UUID.randomUUID(),
        codeId: UUID = UUID.randomUUID(),
    ): SubmissionWithCodeResponseDTO {
        val common = submissionFields(contestId, memberId, problemId, codeId)
        return SubmissionWithCodeResponseDTO(
            id = id,
            createdAt = timestamp,
            updatedAt = timestamp,
            member = common.first,
            problem = common.second,
            language = Submission.Language.CPP_17,
            status = Submission.Status.JUDGING,
            answer = null,
            code = common.third,
            version = 1,
        )
    }

    fun submissionWithExecutionsResponse(
        id: UUID = UUID.randomUUID(),
        contestId: UUID = UUID.randomUUID(),
        memberId: UUID = UUID.randomUUID(),
        problemId: UUID = UUID.randomUUID(),
        codeId: UUID = UUID.randomUUID(),
    ): SubmissionWithCodeAndExecutionsResponseDTO {
        val common = submissionFields(contestId, memberId, problemId, codeId)
        return SubmissionWithCodeAndExecutionsResponseDTO(
            id = id,
            createdAt = timestamp,
            updatedAt = timestamp,
            member = common.first,
            problem = common.second,
            language = Submission.Language.CPP_17,
            status = Submission.Status.JUDGED,
            answer = Submission.Answer.ACCEPTED,
            code = common.third,
            executions = emptyList(),
            version = 1,
        )
    }

    private fun submissionFields(
        contestId: UUID,
        memberId: UUID,
        problemId: UUID,
        codeId: UUID,
    ): Triple<MemberResponseDTO, ProblemResponseDTO, AttachmentResponseDTO> {
        val attachment =
            AttachmentResponseDTO(
                id = codeId,
                createdAt = timestamp,
                updatedAt = timestamp,
                filename = "main.cpp",
                contentType = "text/plain",
                context = com.forsetijudge.core.domain.entity.Attachment.Context.SUBMISSION_CODE,
                version = 1,
            )
        return Triple(
            MemberResponseDTO(
                id = memberId,
                createdAt = timestamp,
                updatedAt = timestamp,
                contestId = contestId,
                type = Member.Type.CONTESTANT,
                name = "Sample member",
                version = 1,
            ),
            ProblemResponseDTO(
                id = problemId,
                createdAt = timestamp,
                updatedAt = timestamp,
                letter = 'A',
                color = "#123456",
                title = "Sample problem",
                description = attachment,
                timeLimit = 1000,
                memoryLimit = 256,
                version = 1,
            ),
            attachment,
        )
    }

    private fun leaderboardResponse(contestId: UUID) = LeaderboardResponseDTO(contestId, emptyList())

    private val timestamp = OffsetDateTime.parse("2026-10-02T12:00:00Z")
}
