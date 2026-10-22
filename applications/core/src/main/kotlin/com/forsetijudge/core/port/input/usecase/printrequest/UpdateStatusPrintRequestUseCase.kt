package com.forsetijudge.core.port.input.usecase.printrequest

import com.forsetijudge.core.domain.entity.PrintRequest
import com.forsetijudge.core.port.dto.response.printrequest.PrintRequestResponseDTO
import java.util.UUID

interface UpdateStatusPrintRequestUseCase {
    /**
     * Updates the status of a print request for a specific contest.
     *
     * @param command The command containing the contest ID and print request ID.
     * @return A [PrintRequestResponseDTO] representing the updated print request.
     */
    fun execute(command: Command): PrintRequestResponseDTO

    /**
     * Command data class representing the input for updating the status of a print request.
     *
     * @property contestId The ID of the contest for which the print request belongs.
     * @property printRequestId The ID of the print request whose status is to be updated.
     */
    data class Command(
        val contestId: UUID,
        val printRequestId: UUID,
        val status: PrintRequest.Status,
    )
}
