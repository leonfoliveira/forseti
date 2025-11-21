package io.github.leonfoliveira.forseti.autojudge.application.dto.input

import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.Submission

data class CreateExecutionInputDTO(
    val submission: Submission,
    val answer: Submission.Answer,
    val totalTestCases: Int,
    val lastTestCase: Int?,
    val input: Attachment,
    val output: List<String>,
)
