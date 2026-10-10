package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.announcement.CreateAnnouncementUseCase
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class AnnouncementControllerTest {
    val createAnnouncementUseCase = mock<CreateAnnouncementUseCase>()
    val mvc = MockMvcTestSupport.mvc(AnnouncementController(createAnnouncementUseCase))
    val contestId = IdGenerator.getUUID()

    @Test
    fun `posts an announcement request`() {
        val contest = MockEntityFactory.contest(id = contestId)
        val member = MockEntityFactory.member(contest = contest)
        val announcement = MockEntityFactory.announcement(contest = contest, member = member)
        whenever(createAnnouncementUseCase.execute(any())).thenReturn(
            announcement.toResponseBodyDTO(),
        )

        mvc
            .perform(
                post("/v1/contests/$contestId/announcements")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"text":"${announcement.text}"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(announcement.id.toString()))
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
            .andExpect(jsonPath("$.member.id").value(member.id.toString()))
            .andExpect(jsonPath("$.text").value(announcement.text))

        verify(createAnnouncementUseCase).execute(
            CreateAnnouncementUseCase.Command(
                contestId = contestId,
                text = announcement.text,
            ),
        )
    }
}
