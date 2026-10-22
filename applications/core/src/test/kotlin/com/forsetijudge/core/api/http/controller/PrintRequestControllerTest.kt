package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.domain.entity.PrintRequest
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.dto.response.printrequest.toResponseDTO
import com.forsetijudge.core.port.input.usecase.printrequest.CreatePrintRequestUseCase
import com.forsetijudge.core.port.input.usecase.printrequest.UpdateStatusPrintRequestUseCase
import com.forsetijudge.core.util.IdGenerator
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

class PrintRequestControllerTest {
    private val createPrintRequestUseCase = mock<CreatePrintRequestUseCase>()
    private val updateStatusPrintRequestUseCase = mock<UpdateStatusPrintRequestUseCase>()

    private val mvc =
        MockMvcTestSupport.mvc(PrintRequestController(createPrintRequestUseCase, updateStatusPrintRequestUseCase))

    private val contestId = IdGenerator.getUUID()

    @Test
    fun `routes create print request requests and returns response bodies`() {
        val printRequest = MockEntityFactory.printRequest()
        whenever(createPrintRequestUseCase.execute(any())).thenReturn(
            printRequest.toResponseDTO(),
        )

        val submissionId = IdGenerator.getUUID()
        mvc
            .perform(
                post("/v1/contests/$contestId/print-requests")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"submissionId":"$submissionId"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(printRequest.id.toString()))

        verify(createPrintRequestUseCase).execute(
            CreatePrintRequestUseCase.Command(
                contestId = contestId,
                submissionId = submissionId,
            ),
        )
    }

    @Test
    fun `routes update print request requests and returns response bodies`() {
        val printRequest = MockEntityFactory.printRequest()
        whenever(updateStatusPrintRequestUseCase.execute(any())).thenReturn(
            printRequest.toResponseDTO(),
        )

        val printRequestId = IdGenerator.getUUID()
        mvc
            .perform(
                patch("/v1/contests/$contestId/print-requests/$printRequestId/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"COMPLETED"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(printRequest.id.toString()))

        verify(updateStatusPrintRequestUseCase).execute(
            UpdateStatusPrintRequestUseCase.Command(
                contestId = contestId,
                printRequestId = printRequestId,
                status = PrintRequest.Status.COMPLETED,
            ),
        )
    }
}
