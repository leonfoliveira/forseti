package io.github.leonfoliveira.judge.worker.docker

import com.opencsv.CSVReader
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.port.BucketAdapter
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStreamReader
import java.nio.file.Files

@Service
class DockerSubmissionRunnerAdapter(
    private val bucketAdapter: BucketAdapter,
    private val dockerSubmissionRunnerConfigFactory: DockerSubmissionRunnerConfigFactory,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun run(submission: Submission): Submission.Answer {
        val problem = submission.problem
        logger.info("Running submission: ${submission.id} for problem: ${problem.id} with language: ${submission.language}")

        val tmpDir = Files.createTempDirectory("judge_${submission.id}").toFile()
        logger.info("Temporary directory created: ${tmpDir.absolutePath}")
        logger.info("Storing submission code file")
        val codeFile = storeCodeFile(submission, tmpDir)
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
                volume = tmpDir,
            )
        logger.info("Starting Docker container")
        container.start()

        try {
            config.createCompileCommand?.let {
                logger.info("Compiling submission code")
                container.exec(it(codeFile))
            }

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
                        )
                    val isCorrect = evaluate(output, expectedOutput)
                    if (!isCorrect) {
                        logger.info("Test case with index: $index failed")
                        status = Submission.Answer.WRONG_ANSWER
                        break
                    }
                } catch (_: DockerContainer.DockerTimeOutException) {
                    logger.info("Test case with index: $index timed out")
                    return Submission.Answer.TIME_LIMIT_EXCEEDED
                } catch (_: DockerContainer.DockerOOMKilledException) {
                    logger.info("Test case with index: $index ran out of memory")
                    return Submission.Answer.MEMORY_LIMIT_EXCEEDED
                } catch (ex: Exception) {
                    logger.info("Error while running test case with index: $index", ex)
                    return Submission.Answer.RUNTIME_ERROR
                }
            }
            logger.info("All test cases passed")
            return status
        } catch (ex: Exception) {
            logger.info("Error while compiling submission", ex)
            return Submission.Answer.COMPILATION_ERROR
        } finally {
            container.kill()
        }
    }

    private fun storeCodeFile(
        submission: Submission,
        tmpDir: File,
    ): File {
        val bytes = bucketAdapter.download(submission.code)
        val romFile = File(tmpDir, submission.code.filename)
        romFile.writeBytes(bytes)
        return romFile
    }

    private fun loadTestCases(problem: Problem): List<Array<String>> {
        val bytes = bucketAdapter.download(problem.testCases)
        val csvReader = CSVReader(InputStreamReader(ByteArrayInputStream(bytes)))
        return csvReader.use { reader ->
            reader.readAll()
        }
    }

    private fun runCode(
        container: DockerContainer,
        config: DockerSubmissionRunnerConfig,
        codeFile: File,
        input: String,
        timeLimit: Int,
    ): String {
        return container.exec(
            command = config.createRunCommand(codeFile),
            input = input,
            timeLimit = timeLimit,
        )
    }

    private fun evaluate(
        output: String,
        expectedOutput: String,
    ): Boolean {
        return output.replace("\n", "") == expectedOutput.replace("\n", "")
    }
}
