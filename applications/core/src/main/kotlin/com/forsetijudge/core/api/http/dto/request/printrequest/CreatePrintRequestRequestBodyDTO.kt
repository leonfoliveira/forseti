package com.forsetijudge.core.api.http.dto.request.printrequest

import java.util.UUID

data class CreatePrintRequestRequestBodyDTO(
    val submissionId: UUID,
)
