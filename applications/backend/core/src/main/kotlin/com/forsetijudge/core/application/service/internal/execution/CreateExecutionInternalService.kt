package com.forsetijudge.core.application.service.internal.execution

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.event.ExecutionEvent
import com.forsetijudge.core.port.driven.repository.ExecutionRepository
import com.forsetijudge.core.port.driving.usecase.internal.attachment.UploadAttachmentInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.execution.CreateExecutionInternalUseCase
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class CreateExecutionInternalService(
    private val executionRepository: ExecutionRepository,
    private val uploadAttachmentInternalUseCase: UploadAttachmentInternalUseCase,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateExecutionInternalUseCase {
    private val logger = SafeLogger(this::class)

    companion object {
        const val RESULT_FILENAME = "result.csv"
        const val RESULT_CONTENT_TYPE = "text/csv"
    }

    override fun execute(command: CreateExecutionInternalUseCase.Command): Execution {
        logger.info("Creating execution for submission with id: ${command.submission.id}")

        val execution =
            Execution(
                submission = command.submission,
                answer = command.answer,
                totalTestCases = command.totalTestCases,
                approvedTestCases = command.approvedTestCases,
                maxCpuTime = command.results.maxOfOrNull { it.cpuTime },
                maxClockTime = command.results.maxOfOrNull { it.clockTime },
                maxPeakMemory = command.results.maxOfOrNull { it.peakMemory },
                details = uploadDetails(command),
            )
        executionRepository.save(execution)
        applicationEventPublisher.publishEvent(ExecutionEvent.Created(execution.id))

        logger.info("Created execution with id: ${execution.id}")
        return execution
    }

    private fun uploadDetails(command: CreateExecutionInternalUseCase.Command): Attachment? {
        if (command.results.isEmpty()) {
            logger.info("No test case execution results. Skipping attachment upload.")
            return null
        }

        logger.info("Uploading execution result with ${command.results.size} test cases.")
        val csvContent =
            "answer,exit_code,cpu_time,clock_time,peak_memory,stdin,stdout,stderr\n" +
                command.results
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
            uploadAttachmentInternalUseCase
                .execute(
                    UploadAttachmentInternalUseCase.Command(
                        contest = command.contest,
                        member = command.member,
                        filename = RESULT_FILENAME,
                        contentType = RESULT_CONTENT_TYPE,
                        context = Attachment.Context.EXECUTION_DETAILS,
                        bytes = bytes,
                    ),
                ).first
        attachment.isCommited = true
        return attachment
    }
}
