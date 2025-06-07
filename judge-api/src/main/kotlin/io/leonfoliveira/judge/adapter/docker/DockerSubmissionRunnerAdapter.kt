package io.leonfoliveira.judge.adapter.docker

import com.opencsv.CSVReader
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStreamReader
import java.nio.file.Files
import java.util.concurrent.TimeoutException

@Service
class DockerSubmissionRunnerAdapter(
    private val bucketAdapter: BucketAdapter,
) : SubmissionRunnerAdapter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun run(submission: Submission): Submission.Answer {
        logger.info("Running submission: ${submission.id} for problem: ${submission.problem.id} with language: ${submission.language}")

        val tmpDir = Files.createTempDirectory("judge_${submission.id}").toFile()
        logger.info("Storing submission code file")
        val codeFile = storeCodeFile(submission, tmpDir)
        logger.info("Loading test cases")
        val testCases = loadTestCases(submission.problem)
        logger.info("Creating Docker container")
        val config = DockerSubmissionRunnerConfig.Builder.get(submission.language).build(codeFile)

        val container = DockerContainerFactory.create(config.image, "judge_${submission.id}", tmpDir)
        logger.info("Starting Docker container")
        container.start()

        try {
            config.compileCommand?.let {
                logger.info("Compiling submission code")
                container.exec(it)
            }

            var status = Submission.Answer.ACCEPTED
            logger.info("Running test cases")
            for ((index, testCase) in testCases.withIndex()) {
                val input = testCase[0]
                val expectedOutput = testCase[1]
                try {
                    val isCorrect = evaluate(container, config, submission, input, expectedOutput)
                    if (!isCorrect) {
                        logger.info("Test case with index: $index failed")
                        status = Submission.Answer.WRONG_ANSWER
                        break
                    }
                } catch (_: TimeoutException) {
                    logger.info("Test case with index: $index timed out")
                    return Submission.Answer.TIME_LIMIT_EXCEEDED
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

    private fun evaluate(
        container: DockerContainer,
        config: DockerSubmissionRunnerConfig,
        submission: Submission,
        input: String,
        expectedOutput: String,
    ): Boolean {
        val output =
            container.exec(
                command = config.runCommand,
                input = input,
                timeLimit = submission.problem.timeLimit.toLong(),
            )

        return output.replace("\n", "") == expectedOutput.replace("\n", "")
    }
}
