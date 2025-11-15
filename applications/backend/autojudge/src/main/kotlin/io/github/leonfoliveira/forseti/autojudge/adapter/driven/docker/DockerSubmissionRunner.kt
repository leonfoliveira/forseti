package io.github.leonfoliveira.forseti.autojudge.adapter.driven.docker

import com.opencsv.CSVReader
import io.github.leonfoliveira.forseti.autojudge.application.dto.input.CreateExecutionInputDTO
import io.github.leonfoliveira.forseti.autojudge.application.port.driven.SubmissionRunner
import io.github.leonfoliveira.forseti.autojudge.application.port.driving.CreateExecutionUseCase
import io.github.leonfoliveira.forseti.common.application.domain.entity.Execution
import io.github.leonfoliveira.forseti.common.application.domain.entity.Problem
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.port.driving.DownloadAttachmentUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStreamReader
import java.nio.file.Files

@Service
class DockerSubmissionRunner(
    private val downloadAttachmentUseCase: DownloadAttachmentUseCase,
    private val createExecutionUseCase: CreateExecutionUseCase,
    private val dockerSubmissionRunnerConfigFactory: DockerSubmissionRunnerConfigFactory,
) : SubmissionRunner {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Runs the submission inside a Docker container, compares the output with the expected output,
     * and returns the execution result.
     *
     * @param submission The submission to be executed.
     * @return The execution result containing the status and outputs.
     */
    override fun run(submission: Submission): Execution {
        val problem = submission.problem
        logger.info("Running submission: ${submission.id} for problem: ${problem.id} with language: ${submission.language}")

        val tmpDir = Files.createTempDirectory("forseti_${submission.id}").toFile()
        logger.info("Temporary directory created: ${tmpDir.absolutePath}")
        logger.info("Storing submission code file")
        // Code file needs to be stored in ROM memory for Docker to access it
        val codeFile = loadCode(submission, tmpDir)
        logger.info("Code file stored at: ${codeFile.absolutePath}")
        logger.info("Loading test cases")
        // Test cases can be loaded in RAM memory as they will be passed via stdin
        val testCases = loadTestCases(problem)
        logger.info("Creating Docker container")
        val config = dockerSubmissionRunnerConfigFactory.get(submission.language)

        val container =
            DockerContainer.create(
                imageName = config.image,
                memoryLimit = problem.memoryLimit,
                name = "forseti_sb.${submission.id}",
            )
        logger.info("Starting Docker container")
        container.start()

        logger.info("Copying code file to container")
        container.copy(codeFile, "/app/${codeFile.name}")

        try {
            config.createCompileCommand?.let {
                logger.info("Compiling submission code")
                container.exec(it(codeFile))
            }

            val outputs = mutableListOf<String>()
            var status = Submission.Answer.ACCEPTED
            var lastTestCase: Int? = null
            logger.info("Running test cases")
            for ((index, testCase) in testCases.withIndex()) {
                val input = testCase[0]
                val expectedOutput = testCase[1]
                try {
                    lastTestCase = index
                    val output =
                        runCode(
                            container = container,
                            config = config,
                            codeFile = codeFile,
                            input = input,
                            timeLimit = problem.timeLimit,
                            memoryLimit = problem.memoryLimit,
                        )
                    outputs.add(output)
                    val isCorrect = evaluate(output, expectedOutput)
                    if (!isCorrect) {
                        logger.info("Test case with index: $index failed")
                        status = Submission.Answer.WRONG_ANSWER
                        break
                    }
                    logger.info("All test cases passed")
                } catch (_: DockerContainer.DockerTimeOutException) {
                    logger.info("Test case with index: $index timed out")
                    return createExecutionUseCase.create(
                        CreateExecutionInputDTO(
                            submission = submission,
                            answer = Submission.Answer.TIME_LIMIT_EXCEEDED,
                            totalTestCases = testCases.size,
                            lastTestCase = index,
                            input = problem.testCases,
                            output = outputs,
                        ),
                    )
                } catch (_: DockerContainer.DockerOOMKilledException) {
                    logger.info("Test case with index: $index ran out of memory")
                    return createExecutionUseCase.create(
                        CreateExecutionInputDTO(
                            submission = submission,
                            answer = Submission.Answer.MEMORY_LIMIT_EXCEEDED,
                            totalTestCases = testCases.size,
                            lastTestCase = index,
                            input = problem.testCases,
                            output = outputs,
                        ),
                    )
                } catch (ex: Exception) {
                    logger.info("Error while running test case with index: $index", ex)
                    return createExecutionUseCase.create(
                        CreateExecutionInputDTO(
                            submission = submission,
                            answer = Submission.Answer.RUNTIME_ERROR,
                            totalTestCases = testCases.size,
                            lastTestCase = index,
                            input = problem.testCases,
                            output = outputs,
                        ),
                    )
                }
            }
            return createExecutionUseCase.create(
                CreateExecutionInputDTO(
                    submission = submission,
                    answer = status,
                    totalTestCases = testCases.size,
                    lastTestCase = lastTestCase,
                    input = problem.testCases,
                    output = outputs,
                ),
            )
        } catch (ex: Exception) {
            logger.info("Error while compiling submission", ex)
            return createExecutionUseCase.create(
                CreateExecutionInputDTO(
                    submission = submission,
                    answer = Submission.Answer.COMPILATION_ERROR,
                    totalTestCases = testCases.size,
                    lastTestCase = null,
                    input = problem.testCases,
                    output = emptyList(),
                ),
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
        val bytes = downloadAttachmentUseCase.download(submission.code)
        val romFile = File(tmpDir, submission.code.filename)
        romFile.writeBytes(bytes)
        return romFile
    }

    /**
     * Downloads the test cases from the attachment bucket and parses them as CSV.
     *
     * @param problem The problem containing the test cases attachment.
     * @return A list of test cases, where each test case is represented as an array of strings.
     */
    private fun loadTestCases(problem: Problem): List<Array<String>> {
        val bytes = downloadAttachmentUseCase.download(problem.testCases)
        val csvReader = CSVReader(InputStreamReader(ByteArrayInputStream(bytes)))
        return csvReader.use { reader ->
            reader.readAll()
        }
    }

    /**
     * Runs the code inside the Docker container with the given input, time limit, and memory limit.
     *
     * @param container The Docker container where the code will be executed.
     * @param config The configuration for running the submission.
     * @param codeFile The file containing the code to be executed.
     * @param input The input to be provided to the code.
     * @param timeLimit The time limit for execution in milliseconds.
     * @param memoryLimit The memory limit for execution in bytes.
     * @return The output produced by the code.
     */
    private fun runCode(
        container: DockerContainer,
        config: DockerSubmissionRunnerConfig,
        codeFile: File,
        input: String,
        timeLimit: Int,
        memoryLimit: Int,
    ): String =
        container.exec(
            command = config.createRunCommand(codeFile, memoryLimit),
            input = input,
            timeLimit = timeLimit,
        )

    /**
     * Evaluates the output of the code against the expected output.
     *
     * @param output The output produced by the code.
     * @param expectedOutput The expected output for comparison.
     * @return True if the output matches the expected output, false otherwise.
     */
    private fun evaluate(
        output: String,
        expectedOutput: String,
    ): Boolean = output.replace("\n", "") == expectedOutput.replace("\n", "")
}
