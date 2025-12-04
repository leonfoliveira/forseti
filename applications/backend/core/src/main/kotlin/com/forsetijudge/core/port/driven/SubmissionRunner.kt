package com.forsetijudge.core.port.driven

import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Submission

interface SubmissionRunner {
    /**
     * Runs the given submission, evaluate the result, and returns an Execution object containing the outcome.
     *
     * @param submission The submission to be run and evaluated.
     * @return An Execution object representing the result of the submission execution.
     */
    fun run(submission: Submission): Execution
}
