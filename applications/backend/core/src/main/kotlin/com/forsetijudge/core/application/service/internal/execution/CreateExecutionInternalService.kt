package com.forsetijudge.core.application.service.internal.execution

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.event.ExecutionEvent
import com.forsetijudge.core.port.driven.repository.ExecutionRepository
import com.forsetijudge.core.port.driving.usecase.internal.attachment.UploadAttachmentInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.execution.CreateExecutionInternalUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class CreateExecutionInternalService(
    private val executionRepository: ExecutionRepository,
    private val uploadAttachmentInternalUseCase: UploadAttachmentInternalUseCase,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateExecutionInternalUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        const val OUTPUT_FILENAME = "output.csv"
        const val OUTPUT_CONTENT_TYPE = "text/csv"
    }

    override fun execute(command: CreateExecutionInternalUseCase.Command): Execution {
        logger.info("Creating execution for submission with id: {}", command.submission.id)

        val csvContent = command.output.joinToString("\n")
        val bytes = csvContent.toByteArray()
        val output =
            uploadAttachmentInternalUseCase
                .execute(
                    UploadAttachmentInternalUseCase.Command(
                        contest = command.contest,
                        member = command.member,
                        filename = OUTPUT_FILENAME,
                        contentType = OUTPUT_CONTENT_TYPE,
                        context = Attachment.Context.EXECUTION_OUTPUT,
                        bytes = bytes,
                    ),
                ).first

        val execution =
            Execution(
                submission = command.submission,
                answer = command.answer,
                totalTestCases = command.totalTestCases,
                approvedTestCases = command.approvedTestCases,
                input = command.input,
                output = output,
            )
        executionRepository.save(execution)
        applicationEventPublisher.publishEvent(ExecutionEvent.Created(execution))

        logger.info("Created execution with id: {}", execution.id)
        return execution
    }
}
