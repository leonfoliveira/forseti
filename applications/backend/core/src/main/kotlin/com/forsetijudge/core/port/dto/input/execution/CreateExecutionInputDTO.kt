package com.forsetijudge.core.port.dto.input.execution

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Submission

data class CreateExecutionInputDTO(
    val submission: Submission,
    val answer: Submission.Answer,
    val totalTestCases: Int,
    val lastTestCase: Int?,
    val input: Attachment,
    val output: List<String>,
)
