package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseBodyDTO
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import tools.jackson.databind.DeserializationFeature
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.module.SimpleModule
import tools.jackson.module.kotlin.KotlinModule
import java.time.OffsetDateTime
import java.util.UUID

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
        ContestResponseBodyDTO(
            id = id,
            createdAt = timestamp,
            updatedAt = timestamp,
            slug = "sample-contest",
            title = "Sample contest",
            languages = listOf(Submission.Language.CPP_17),
            startAt = timestamp.plusHours(1),
            endAt = timestamp.plusHours(2),
            version = 1,
        )

    fun contestWithDetailsResponse(id: UUID = UUID.randomUUID()) =
        ContestWithMembersAndProblemsResponseBodyDTO(
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
        AdminDashboardResponseBodyDTO(
            contest = contestWithDetailsResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
        )

    fun contestantDashboardResponse(id: UUID = UUID.randomUUID()) =
        ContestantDashboardResponseBodyDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            memberSubmissions = emptyList(),
            announcements = emptyList(),
        )

    fun guestDashboardResponse(id: UUID = UUID.randomUUID()) =
        GuestDashboardResponseBodyDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
        )

    fun judgeDashboardResponse(id: UUID = UUID.randomUUID()) =
        JudgeDashboardResponseBodyDTO(
            contest = contestResponse(id),
            leaderboard = leaderboardResponse(id),
            members = emptyList(),
            problems = emptyList(),
            submissions = emptyList(),
            announcements = emptyList(),
        )

    fun submissionResponse(
        id: UUID = UUID.randomUUID(),
        contestId: UUID = UUID.randomUUID(),
        memberId: UUID = UUID.randomUUID(),
        problemId: UUID = UUID.randomUUID(),
        codeId: UUID = UUID.randomUUID(),
    ): SubmissionWithCodeResponseBodyDTO {
        val common = submissionFields(contestId, memberId, problemId, codeId)
        return SubmissionWithCodeResponseBodyDTO(
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
    ): SubmissionWithCodeAndExecutionsResponseBodyDTO {
        val common = submissionFields(contestId, memberId, problemId, codeId)
        return SubmissionWithCodeAndExecutionsResponseBodyDTO(
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
    ): Triple<MemberResponseBodyDTO, ProblemResponseBodyDTO, AttachmentResponseDTO> {
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
            MemberResponseBodyDTO(
                id = memberId,
                createdAt = timestamp,
                updatedAt = timestamp,
                contestId = contestId,
                type = Member.Type.CONTESTANT,
                name = "Sample member",
                version = 1,
            ),
            ProblemResponseBodyDTO(
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

    private fun leaderboardResponse(contestId: UUID) = LeaderboardResponseBodyDTO(contestId, emptyList())

    private val timestamp = OffsetDateTime.parse("2026-10-02T12:00:00Z")
}
