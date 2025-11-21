package live.forseti.core.application.service.execution

import live.forseti.core.application.service.attachment.UploadAttachmentService
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.Contest
import live.forseti.core.domain.entity.Execution
import live.forseti.core.domain.entity.Member
import live.forseti.core.port.driven.repository.ExecutionRepository
import live.forseti.core.port.driving.usecase.execution.CreateExecutionUseCase
import live.forseti.core.port.dto.input.execution.CreateExecutionInputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CreateExecutionService(
    private val executionRepository: ExecutionRepository,
    private val uploadAttachmentService: UploadAttachmentService,
) : CreateExecutionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    private val outputFileName = "output.csv"
    private val outputContentType = "text/csv"

    /**
     * Creates a new execution for the given submission.
     *
     * @param inputDTO The input data transfer object containing submission and execution details.
     * @return The created Execution entity.
     */
    @Transactional
    override fun create(inputDTO: CreateExecutionInputDTO): Execution {
        logger.info("Creating execution for submission=${inputDTO.submission.id}")

        val execution =
            Execution(
                submission = inputDTO.submission,
                answer = inputDTO.answer,
                totalTestCases = inputDTO.totalTestCases,
                lastTestCase = inputDTO.lastTestCase,
                input = inputDTO.input,
                output = uploadOutput(inputDTO.submission.contest, inputDTO.output),
            )
        executionRepository.save(execution)

        logger.info("Created execution=${execution.id}")
        return execution
    }

    /**
     * Uploads the execution output as an attachment.
     *
     * @param contest The contest to which the execution belongs.
     * @param output The list of output strings to be uploaded.
     * @return The uploaded Attachment entity.
     */
    private fun uploadOutput(
        contest: Contest,
        output: List<String>,
    ): Attachment {
        logger.info("Uploading execution output")

        val csvContent = output.joinToString("\n")
        val bytes = csvContent.toByteArray()
        val attachment =
            uploadAttachmentService.upload(
                contestId = contest.id,
                memberId = Member.Companion.AUTOJUDGE_ID,
                filename = outputFileName,
                contentType = outputContentType,
                context = Attachment.Context.EXECUTION_OUTPUT,
                bytes = bytes,
            )
        return attachment
    }
}
