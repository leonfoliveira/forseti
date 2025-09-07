package io.github.leonfoliveira.judge.autojudge.docker

import com.opencsv.CSVReader
import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.entity.Execution
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.port.AttachmentBucketAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.ExecutionRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStreamReader
import java.nio.file.Files

@Service
class DockerSubmissionRunnerAdapter(
    private val attachmentRepository: AttachmentRepository,
    private val executionRepository: ExecutionRepository,
    private val attachmentBucketAdapter: AttachmentBucketAdapter,
    private val dockerSubmissionRunnerConfigFactory: DockerSubmissionRunnerConfigFactory,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun run(submission: Submission): Execution {
        val problem = submission.problem
        logger.info("Running submission: ${submission.id} for problem: ${problem.id} with language: ${submission.language}")

        val tmpDir = Files.createTempDirectory("judge_${submission.id}").toFile()
        logger.info("Temporary directory created: ${tmpDir.absolutePath}")
        logger.info("Storing submission code file")
        val codeFile = loadCode(submission, tmpDir)
        logger.info("Code file stored at: ${codeFile.absolutePath}")
        logger.info("Loading test cases")
        val testCases = loadTestCases(problem)
        logger.info("Creating Docker container")
        val config = dockerSubmissionRunnerConfigFactory.get(submission.language)

        val container =
            DockerContainer.create(
                imageName = config.image,
                memoryLimit = problem.memoryLimit,
                name = "judge_${submission.id}",
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
            logger.info("Running test cases")
            for ((index, testCase) in testCases.withIndex()) {
                val input = testCase[0]
                val expectedOutput = testCase[1]
                try {
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
                } catch (_: DockerContainer.DockerTimeOutException) {
                    logger.info("Test case with index: $index timed out")
                    val execution =
                        Execution(
                            submission = submission,
                            answer = Submission.Answer.TIME_LIMIT_EXCEEDED,
                            totalTestCases = testCases.size,
                            lastTestCase = index,
                            input = problem.testCases,
                            output = uploadOutput(outputs),
                        )
                    return executionRepository.save(execution)
                } catch (_: DockerContainer.DockerOOMKilledException) {
                    logger.info("Test case with index: $index ran out of memory")
                    val execution =
                        Execution(
                            submission = submission,
                            answer = Submission.Answer.MEMORY_LIMIT_EXCEEDED,
                            totalTestCases = testCases.size,
                            lastTestCase = index,
                            input = problem.testCases,
                            output = uploadOutput(outputs),
                        )
                    return executionRepository.save(execution)
                } catch (ex: Exception) {
                    logger.info("Error while running test case with index: $index", ex)
                    val execution =
                        Execution(
                            submission = submission,
                            answer = Submission.Answer.RUNTIME_ERROR,
                            totalTestCases = testCases.size,
                            lastTestCase = index,
                            input = problem.testCases,
                            output = uploadOutput(outputs),
                        )
                    return executionRepository.save(execution)
                }
            }
            logger.info("All test cases passed")
            val execution =
                Execution(
                    submission = submission,
                    answer = status,
                    totalTestCases = testCases.size,
                    lastTestCase = testCases.size - 1,
                    input = problem.testCases,
                    output = uploadOutput(outputs),
                )
            return executionRepository.save(execution)
        } catch (ex: Exception) {
            logger.info("Error while compiling submission", ex)
            val execution =
                Execution(
                    submission = submission,
                    answer = Submission.Answer.COMPILATION_ERROR,
                    totalTestCases = testCases.size,
                    lastTestCase = 0,
                    input = problem.testCases,
                    output = uploadOutput(emptyList()),
                )
            return executionRepository.save(execution)
        } finally {
            container.kill()
        }
    }

    /**
     * Downloads the code file from the attachment bucket and stores it in a temporary directory.
     * It needs to be store in ROM memory because the Docker container needs to access it as a volume.
     */
    private fun loadCode(
        submission: Submission,
        tmpDir: File,
    ): File {
        val bytes = attachmentBucketAdapter.download(submission.code)
        val romFile = File(tmpDir, submission.code.filename)
        romFile.writeBytes(bytes)
        return romFile
    }

    /**
     * Downloads the test cases from the attachment bucket and parses them as CSV.
     */
    private fun loadTestCases(problem: Problem): List<Array<String>> {
        val bytes = attachmentBucketAdapter.download(problem.testCases)
        val csvReader = CSVReader(InputStreamReader(ByteArrayInputStream(bytes)))
        return csvReader.use { reader ->
            reader.readAll()
        }
    }

    /**
     * Uploads the output of the execution to the attachment bucket as a CSV file.
     */
    private fun uploadOutput(output: List<String>): Attachment {
        val csvContent = output.joinToString("\n")
        val bytes = csvContent.toByteArray()
        val attachment =
            Attachment(
                filename = "output.csv",
                contentType = "text/csv",
            )
        attachmentRepository.save(attachment)
        attachmentBucketAdapter.upload(attachment, bytes)
        return attachment
    }

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

    private fun evaluate(
        output: String,
        expectedOutput: String,
    ): Boolean = output.replace("\n", "") == expectedOutput.replace("\n", "")
}
