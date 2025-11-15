package io.github.leonfoliveira.forseti.autojudge.application.dto.input

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission

data class CreateExecutionInputDTO(
    val submission: Submission,
    val answer: Submission.Answer,
    val totalTestCases: Int,
    val lastTestCase: Int?,
    val input: Attachment,
    val output: List<String>,
)
