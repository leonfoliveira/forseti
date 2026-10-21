package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.printrequest.CreatePrintRequestRequestBodyDTO
import com.forsetijudge.core.api.http.dto.request.printrequest.UpdateIsCompletedPrintRequestRequestBodyDTO
import com.forsetijudge.core.port.dto.response.printrequest.PrintRequestResponseDTO
import com.forsetijudge.core.port.input.usecase.printrequest.CreatePrintRequestUseCase
import com.forsetijudge.core.port.input.usecase.printrequest.UpdateIsCompletedPrintRequestUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class PrintRequestController(
    private val createPrintRequestUseCase: CreatePrintRequestUseCase,
    private val updateIsCompletedPrintRequestUseCase: UpdateIsCompletedPrintRequestUseCase,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}/print-requests")
    fun createPrintRequest(
        @PathVariable contestId: UUID,
        @RequestBody body: CreatePrintRequestRequestBodyDTO,
    ): ResponseEntity<PrintRequestResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/print-requests")
        val printRequest =
            createPrintRequestUseCase.execute(
                CreatePrintRequestUseCase.Command(contestId = contestId, submissionId = body.submissionId),
            )
        return ResponseEntity.ok(printRequest)
    }

    @PatchMapping("/contests/{contestId}/print-requests/{printRequestId}/complete")
    fun updateIsCompletedPrintRequest(
        @PathVariable contestId: UUID,
        @PathVariable printRequestId: UUID,
        @RequestBody body: UpdateIsCompletedPrintRequestRequestBodyDTO,
    ): ResponseEntity<PrintRequestResponseDTO> {
        logger.info("[PATCH] /v1/contests/$contestId/print-requests/$printRequestId/is-completed")
        val printRequest =
            updateIsCompletedPrintRequestUseCase.execute(
                UpdateIsCompletedPrintRequestUseCase.Command(
                    contestId = contestId,
                    printRequestId = printRequestId,
                    isCompleted = body.isCompleted,
                ),
            )
        return ResponseEntity.ok(printRequest)
    }
}
