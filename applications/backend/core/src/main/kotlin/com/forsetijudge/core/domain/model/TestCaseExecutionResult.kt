package com.forsetijudge.core.domain.model

import com.forsetijudge.core.domain.entity.Submission

/**
 * Represents the result of executing a test case for a submission.
 *
 * @param answer The answer associated with the submission after executing the test case.
 * @param exitCode The exit code returned by the process after executing the test case.
 * @param cpuTime The total CPU time consumed during the execution of the test case in milliseconds.
 * @param clockTime The total clock time taken for the execution of the test case in milliseconds.
 * @param peakMemory The peak memory usage during the execution of the test case in kilobytes.
 * @param stdin The standard input provided to the process during the execution of the test case.
 * @param stdout The standard output produced by the process during the execution of the test case.
 * @param stderr The standard error produced by the process during the execution of the test case.
 */
data class TestCaseExecutionResult(
    val answer: Submission.Answer,
    val exitCode: Int,
    val cpuTime: Long,
    val clockTime: Long,
    val peakMemory: Long,
    val stdin: String,
    val stdout: String?,
    val stderr: String?,
)
