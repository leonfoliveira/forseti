package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.port.input.usecase.clarification.AnswerClarificationUseCase
import com.forsetijudge.core.port.input.usecase.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.input.usecase.clarification.PublishClarificationUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class ClarificationControllerTest {
    private val answerClarificationUseCase = mock<AnswerClarificationUseCase>()
    private val createClarificationUseCase = mock<CreateClarificationUseCase>()
    private val publishClarificationUseCase = mock<PublishClarificationUseCase>()
    val contest = MockEntityFactory.contest()
    val mvc =
        MockMvcTestSupport.mvc(
            ClarificationController(
                answerClarificationUseCase,
                createClarificationUseCase,
                publishClarificationUseCase,
            ),
        )

    @Test
    fun `test create clarification endpoint`() {
        val clarification = MockEntityFactory.clarification()
        whenever(createClarificationUseCase.execute(any())).thenReturn(clarification.toResponseDTO())

        mvc
            .perform(
                post("/v1/contests/${contest.id}/clarifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"text":"Test clarification"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(clarification.id.toString()))
            .andExpect(jsonPath("$.text").value(clarification.text))

        verify(createClarificationUseCase).execute(
            CreateClarificationUseCase.Command(
                contestId = contest.id,
                problemId = null,
                text = "Test clarification",
            ),
        )
    }

    @Test
    fun `test answer clarification endpoint`() {
        val clarification = MockEntityFactory.clarification()
        whenever(answerClarificationUseCase.execute(any())).thenReturn(clarification.toResponseDTO())

        mvc
            .perform(
                patch("/v1/contests/${contest.id}/clarifications/${clarification.id}/answer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"text":"Test answer"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(clarification.id.toString()))
            .andExpect(jsonPath("$.text").value(clarification.text))

        verify(answerClarificationUseCase).execute(
            AnswerClarificationUseCase.Command(
                contestId = contest.id,
                clarificationId = clarification.id,
                text = "Test answer",
            ),
        )
    }

    @Test
    fun `test publish clarification endpoint`() {
        val clarification = MockEntityFactory.clarification()
        whenever(publishClarificationUseCase.execute(any())).thenReturn(clarification.toResponseDTO())

        mvc
            .perform(
                patch("/v1/contests/${contest.id}/clarifications/${clarification.id}/publish")
                    .contentType(MediaType.APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(clarification.id.toString()))
            .andExpect(jsonPath("$.text").value(clarification.text))

        verify(publishClarificationUseCase).execute(
            PublishClarificationUseCase.Command(
                contestId = contest.id,
                clarificationId = clarification.id,
            ),
        )
    }
}
