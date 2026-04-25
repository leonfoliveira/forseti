package com.forsetijudge.core.application.service.internal.execution

import com.forsetijudge.core.application.service.internal.attachment.AttachmentUploader
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.ExecutionEvent
import com.forsetijudge.core.domain.model.TestCaseExecutionResult
import com.forsetijudge.core.port.driven.repository.ExecutionRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class ExecutionCreator(
    private val executionRepository: ExecutionRepository,
    private val attachmentUploader: AttachmentUploader,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = SafeLogger(this::class)

    companion object {
        const val RESULT_FILENAME = "result.csv"
        const val RESULT_CONTENT_TYPE = "text/csv"
    }

    fun create(
        contest: Contest,
        member: Member,
        submission: Submission,
        answer: Submission.Answer,
        totalTestCases: Int,
        approvedTestCases: Int,
        results: List<TestCaseExecutionResult>,
    ): Execution {
        logger.info("Creating execution for submission with id: ${submission.id}")

        val execution =
            Execution(
                submission = submission,
                answer = answer,
                totalTestCases = totalTestCases,
                approvedTestCases = approvedTestCases,
                maxCpuTime = results.maxOfOrNull { it.cpuTime },
                maxClockTime = results.maxOfOrNull { it.clockTime },
                maxPeakMemory = results.maxOfOrNull { it.peakMemory },
                details = uploadDetails(contest, member, results),
            )
        executionRepository.save(execution)
        applicationEventPublisher.publishEvent(ExecutionEvent.Created(execution.id))

        logger.info("Created execution with id: ${execution.id}")
        return execution
    }

    private fun uploadDetails(
        contest: Contest,
        member: Member,
        results: List<TestCaseExecutionResult>,
    ): Attachment? {
        if (results.isEmpty()) {
            logger.info("No test case execution results. Skipping attachment upload.")
            return null
        }

        logger.info("Uploading execution result with ${results.size} test cases.")
        val csvContent =
            "answer,exit_code,cpu_time,clock_time,peak_memory,stdin,stdout,stderr\n" +
                results
                    .mapIndexed { index, result ->
                        listOf(
                            index,
                            result.answer,
                            result.exitCode,
                            result.cpuTime,
                            result.clockTime,
                            result.peakMemory,
                            result.stdin.replace("\n", "\\n"),
                            result.stdout?.replace("\n", "\\n") ?: "",
                            result.stderr?.replace("\n", "\\n") ?: "",
                        ).joinToString(separator = ",")
                    }.joinToString(separator = "\n")
        val bytes = csvContent.toByteArray()
        val attachment =
            attachmentUploader
                .upload(
                    contest = contest,
                    member = member,
                    filename = RESULT_FILENAME,
                    contentType = RESULT_CONTENT_TYPE,
                    context = Attachment.Context.EXECUTION_DETAILS,
                    bytes = bytes,
                ).first
        attachment.isCommited = true
        return attachment
    }
}
