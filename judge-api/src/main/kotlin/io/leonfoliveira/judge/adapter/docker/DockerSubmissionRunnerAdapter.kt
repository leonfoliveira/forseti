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

    override fun run(submission: Submission): Submission.Status {
        val tmpDir = Files.createTempDirectory("judge_${submission.id}").toFile()
        val codeFile = storeCodeFile(submission, tmpDir)
        val testCases = loadTestCases(submission.problem)
        val config = DockerSubmissionRunnerConfig.Builder.get(submission.language).build(codeFile)

        val container = DockerContainerFactory.create(config.image, "judge_${submission.id}", tmpDir)
        container.start()

        try {
            config.compileCommand?.let { container.exec(it) }
            try {
                var status = Submission.Status.ACCEPTED
                for ((input, expectedOutput) in testCases) {
                    val isCorrect = evaluate(container, config, submission, input, expectedOutput)
                    if (!isCorrect) {
                        status = Submission.Status.WRONG_ANSWER
                        break
                    }
                }
                return status
            } catch (ex: TimeoutException) {
                return Submission.Status.TIME_LIMIT_EXCEEDED
            } catch (ex: Exception) {
                logger.error("Error while running submission ${submission.id}", ex)
                return Submission.Status.RUNTIME_ERROR
            }
        } catch (ex: Exception) {
            logger.error("Error while compiling submission ${submission.id}", ex)
            return Submission.Status.COMPILATION_ERROR
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
