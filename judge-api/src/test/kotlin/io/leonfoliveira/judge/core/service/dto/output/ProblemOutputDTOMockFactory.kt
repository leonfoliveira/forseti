package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.model.DownloadAttachment

object ProblemOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Problem Title",
        description: String = "Problem Description",
        timeLimit: Int = 1000,
        testCases: DownloadAttachment =
            DownloadAttachment(
                filename = "test_cases.csv",
                url = "https://example.com/test_cases.csv",
            ),
    ) = ProblemOutputDTO(
        id = id,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
    )
}
