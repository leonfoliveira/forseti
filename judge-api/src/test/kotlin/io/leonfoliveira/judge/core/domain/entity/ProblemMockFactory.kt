package io.leonfoliveira.judge.core.domain.entity

import io.leonfoliveira.judge.core.domain.model.Attachment

object ProblemMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Problem Name",
        description: String = "Problem Description",
        timeLimit: Int = 1000,
        testCases: Attachment =
            Attachment(
                filename = "test_cases.kt",
                key = "test_cases_key",
            ),
        submissions: List<Submission> = emptyList(),
        contest: Contest = ContestMockFactory.build(),
    ) = Problem(
        id = id,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
        submissions = submissions,
        contest = contest,
    )
}
