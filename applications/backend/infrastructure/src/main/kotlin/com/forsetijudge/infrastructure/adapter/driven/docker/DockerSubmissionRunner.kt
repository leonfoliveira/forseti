package com.forsetijudge.infrastructure.adapter.driven.docker

import com.forsetijudge.core.application.helper.attachment.AttachmentDownloader
import com.forsetijudge.core.application.helper.execution.ExecutionCreator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.TestCaseExecutionResult
import com.forsetijudge.core.port.driven.sandbox.SubmissionRunner
import com.opencsv.CSVReader
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStreamReader
import java.nio.file.Files

@Component
class DockerSubmissionRunner(
    private val attachmentDownloader: AttachmentDownloader,
    private val executionCreator: ExecutionCreator,
    @Value("\${spring.application.version}")
    private val version: String,
) : SubmissionRunner {
    private val logger = SafeLogger(this::class)

    /**
     * Runs the submission inside a Docker container, compares the output with the expected output,
     * and returns the execution result.
     *
     * @param submission The submission to be executed.
     * @return The execution result containing the status and outputs.
     */
    override fun run(submission: Submission): Execution {
        val problem = submission.problem
        logger.info(
            "Running submission: ${submission.id} for problem: ${problem.id} with language: ${submission.language}",
        )

        // Create a temporary directory to store the code file
        val tmpDir = Files.createTempDirectory("forseti_${submission.id}").toFile()
        logger.info("Temporary directory created: ${tmpDir.absolutePath}.")
        // Code file needs to be stored in ROM memory for Docker to access it
        val codeFile = loadCode(submission, tmpDir)
        logger.info("Code file loaded: ${codeFile.absolutePath}.")
        // Test cases can be loaded in RAM memory as they will be passed via stdin
        val testCases = loadTestCases(problem)
        logger.info("Test cases loaded: ${testCases.size} test cases.")

        val container = DockerSandboxContainer(version, submission, codeFile)
        container.start()

        try {
            try {
                container.compile()
            } catch (ex: Exception) {
                logger.info("Compilation failed: ${ex.message}")
                return executionCreator.create(
                    contest = submission.contest,
                    member = submission.member,
                    submission = submission,
                    answer = Submission.Answer.COMPILATION_ERROR,
                    totalTestCases = testCases.size,
                    approvedTestCases = 0,
                    results = emptyList(),
                )
            }

            val results = mutableListOf<TestCaseExecutionResult>()
            var approvedTestCases = 0

            logger.info("Running ${testCases.size} test cases")
            for ((index, testCase) in testCases.withIndex()) {
                val stdin = testCase[0]
                val expectedStdout = testCase[1]

                val result = container.run(stdin)
                val answer = evaluate(result, expectedStdout)
                results.add(
                    TestCaseExecutionResult(
                        answer = answer,
                        exitCode = result.exitCode,
                        cpuTime = result.cpuTime,
                        clockTime = result.clockTime,
                        peakMemory = result.peakMemory,
                        stdin = stdin,
                        stdout = result.stdout,
                        stderr = result.stderr,
                    ),
                )

                if (answer == Submission.Answer.ACCEPTED) {
                    approvedTestCases++
                } else {
                    logger.info("Test case ${index + 1} failed with answer: $answer")
                    return executionCreator.create(
                        contest = submission.contest,
                        member = submission.member,
                        submission = submission,
                        answer = answer,
                        totalTestCases = testCases.size,
                        approvedTestCases = approvedTestCases,
                        results = results,
                    )
                }
            }
            logger.info("All test cases passed")
            return executionCreator.create(
                contest = submission.contest,
                member = submission.member,
                submission = submission,
                answer = Submission.Answer.ACCEPTED,
                totalTestCases = testCases.size,
                approvedTestCases = approvedTestCases,
                results = results,
            )
        } finally {
            container.kill()
        }
    }

    /**
     * Downloads the code file from the attachment bucket and stores it in a temporary directory.
     * It needs to be store in ROM memory because the Docker container needs to access it as a volume.
     *
     * @param submission The submission containing the code attachment.
     * @param tmpDir The temporary directory to store the code file.
     * @return The file object pointing to the stored code file.
     */
    private fun loadCode(
        submission: Submission,
        tmpDir: File,
    ): File {
        val bytes =
            attachmentDownloader.download(
                attachment = submission.code,
            )
        val romFile = File(tmpDir, submission.code.filename)
        romFile.writeBytes(bytes)
        return romFile
    }

    /**
     * Downloads the test cases from the attachment bucket and parses them as CSV.
     *
     * @param problem The problem containing the test cases' attachment.
     * @return A list of test cases, where each test case is represented as an array of strings.
     */
    private fun loadTestCases(problem: Problem): List<Array<String>> {
        val bytes =
            attachmentDownloader.download(
                attachment = problem.testCases,
            )
        val csvReader = CSVReader(InputStreamReader(ByteArrayInputStream(bytes)))
        return csvReader.use { reader ->
            reader.readAll()
        }
    }

    /**
     * Evaluates the output of the code against the expected output.
     *
     * @param result The result produced by the code execution, containing the status and outputs.
     * @param expectedStdout The expected output for comparison.
     * @return The submission answer based on the evaluation of the result against the expected output.
     */
    private fun evaluate(
        result: DockerSandboxContainer.RunResult,
        expectedStdout: String,
    ): Submission.Answer =
        when (result.status) {
            DockerSandboxContainer.RunResult.Status.MLE -> Submission.Answer.MEMORY_LIMIT_EXCEEDED
            DockerSandboxContainer.RunResult.Status.TLE -> Submission.Answer.TIME_LIMIT_EXCEEDED
            DockerSandboxContainer.RunResult.Status.RE -> Submission.Answer.RUNTIME_ERROR
            DockerSandboxContainer.RunResult.Status.OK ->
                if (result.stdout?.replace("\n", "") == expectedStdout.replace("\n", "")) {
                    Submission.Answer.ACCEPTED
                } else {
                    Submission.Answer.WRONG_ANSWER
                }
        }
}
