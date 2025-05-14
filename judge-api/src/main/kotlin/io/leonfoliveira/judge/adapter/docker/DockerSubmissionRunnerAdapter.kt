package io.leonfoliveira.judge.adapter.docker

import com.opencsv.CSVReader
import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import org.springframework.stereotype.Service
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStreamReader
import java.nio.file.Files
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@Service
class DockerSubmissionRunnerAdapter(
    private val bucketAdapter: BucketAdapter,
) : SubmissionRunnerAdapter {
    override fun run(submission: Submission): Submission.Status {
        val tmpDir = Files.createTempDirectory("judge_${submission.id}").toFile()
        val codeFile = storeCodeFile(submission, tmpDir)
        val testCases = loadTestCases(submission.problem)
        val config = DockerSubmissionRunnerConfig.Builder.get(submission.language).build(codeFile)

        val container = DockerContainer.create(config.image, "judge_${submission.id}", tmpDir)
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
                return Submission.Status.RUNTIME_ERROR
            }
        } catch (ex: Exception) {
            return Submission.Status.COMPILATION_ERROR
        } finally {
            container.stop()
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
        val executor = Executors.newSingleThreadExecutor()
        val future =
            executor.submit {
                container.exec(
                    command = config.runCommand,
                    input = input,
                )
            }

        try {
            val output = future.get(submission.problem.timeLimit * 1L, TimeUnit.SECONDS) as String
            return output.replace("\n", "") == expectedOutput.replace("\n", "")
        } finally {
            executor.shutdownNow()
        }
    }
}
