package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import com.forsetijudge.core.port.input.usecase.contest.CreateContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.DeleteContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.FindAllContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.input.usecase.contest.ForceEndContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.ForceStartContestUseCase
import com.forsetijudge.core.port.input.usecase.contest.UpdateContestUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.OffsetDateTime
import java.util.UUID

class ContestControllerTest {
    private val findBySlug = mock<FindContestBySlugUseCase>()
    private val findAll = mock<FindAllContestUseCase>()
    private val create = mock<CreateContestUseCase>()
    private val update = mock<UpdateContestUseCase>()
    private val forceStart = mock<ForceStartContestUseCase>()
    private val forceEnd = mock<ForceEndContestUseCase>()
    private val delete = mock<DeleteContestUseCase>()
    private val mvc =
        MockMvcTestSupport.mvc(
            ContestController(findBySlug, findAll, create, update, forceStart, forceEnd, delete),
        )
    private val contestId = UUID.randomUUID()
    private val timestamp = OffsetDateTime.parse("2026-10-02T12:00:00Z")

    @Test
    fun `gets contest by slug and lists contests`() {
        val response = MockMvcTestSupport.contestResponse(contestId)
        whenever(findBySlug.execute(any())).thenReturn(response)
        whenever(findAll.execute()).thenReturn(listOf(response))

        mvc
            .perform(get("/v1/contests/slug/spring-cup"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("sample-contest"))
        verify(findBySlug).execute(FindContestBySlugUseCase.Command("spring-cup"))

        mvc
            .perform(get("/v1/contests"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value(contestId.toString()))
        verify(findAll).execute()
    }

    @Test
    fun `creates contest from JSON request`() {
        val startAt = timestamp.plusHours(1)
        val endAt = timestamp.plusHours(3)
        whenever(create.execute(any())).thenReturn(MockMvcTestSupport.contestResponse(contestId))

        mvc
            .perform(
                post("/v1/contests")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"slug":"spring-cup","title":"Spring Cup","languages":["CPP_17"],"startAt":"$startAt","endAt":"$endAt"}""",
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(contestId.toString()))

        verify(create).execute(
            CreateContestUseCase.Command(
                "spring-cup",
                "Spring Cup",
                listOf(Submission.Language.CPP_17),
                startAt,
                endAt,
            ),
        )
    }

    @Test
    fun `updates contest and maps nested member and problem requests`() {
        val memberId = UUID.randomUUID()
        val descriptionId = UUID.randomUUID()
        val testCasesId = UUID.randomUUID()
        val startAt = timestamp.plusHours(1)
        val endAt = timestamp.plusHours(3)
        whenever(update.execute(any())).thenReturn(MockMvcTestSupport.contestWithDetailsResponse(contestId))

        mvc
            .perform(
                put("/v1/contests/$contestId")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "slug":"spring-cup",
                          "title":"Spring Cup",
                          "languages":["CPP_17"],
                          "startAt":"$startAt",
                          "endAt":"$endAt",
                          "members":[{"id":"$memberId","type":"ADMIN","name":"Coach","login":"coach","password":"pw"}],
                          "problems":[{"letter":"A","color":"#123456","title":"Warmup","description":{"id":"$descriptionId"},"timeLimit":1000,"memoryLimit":256,"testCases":{"id":"$testCasesId"}}]
                        }
                        """.trimIndent(),
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(contestId.toString()))

        verify(update).execute(
            UpdateContestUseCase.Command(
                contestId = contestId,
                slug = "spring-cup",
                title = "Spring Cup",
                languages = listOf(Submission.Language.CPP_17),
                startAt = startAt,
                endAt = endAt,
                members =
                    listOf(
                        UpdateContestUseCase.Command.Member(
                            memberId,
                            Member.Type.ADMIN,
                            "Coach",
                            "coach",
                            "pw",
                        ),
                    ),
                problems =
                    listOf(
                        UpdateContestUseCase.Command.Problem(
                            id = null,
                            letter = 'A',
                            color = "#123456",
                            title = "Warmup",
                            description = AttachmentCommandDTO(descriptionId),
                            timeLimit = 1000,
                            memoryLimit = 256,
                            testCases = AttachmentCommandDTO(testCasesId),
                        ),
                    ),
            ),
        )
    }

    @Test
    fun `routes force start and end with contest id`() {
        val response = MockMvcTestSupport.contestWithDetailsResponse(contestId)
        whenever(forceStart.execute(any())).thenReturn(response)
        whenever(forceEnd.execute(any())).thenReturn(response)

        mvc
            .perform(put("/v1/contests/$contestId:force-start"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(contestId.toString()))
        verify(forceStart).execute(ForceStartContestUseCase.Command(contestId))

        mvc
            .perform(put("/v1/contests/$contestId:force-end"))
            .andExpect(status().isOk)
        verify(forceEnd).execute(ForceEndContestUseCase.Command(contestId))
    }

    @Test
    fun `deletes contest and returns no content`() {
        mvc
            .perform(delete("/v1/contests/$contestId"))
            .andExpect(status().isNoContent)
            .andExpect(content().string(""))

        verify(delete).execute(DeleteContestUseCase.Command(contestId))
    }
}
