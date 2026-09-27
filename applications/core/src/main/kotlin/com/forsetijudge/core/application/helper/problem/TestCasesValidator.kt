package com.forsetijudge.core.application.helper.problem

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.util.SafeLogger
import com.opencsv.CSVReader
import java.io.ByteArrayInputStream
import java.io.InputStreamReader
import org.springframework.stereotype.Component

@Component
class TestCasesValidator(
    private val attachmentBucket: AttachmentBucket,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Validates the test cases attachment.
     * The attachment must be a CSV file with exactly two columns: input and output.
     *
     * @param testCases The attachment to validate.
     * @throws BusinessException if the attachment is not valid.
     */
    fun validate(testCases: Attachment) {
        logger.info("Validating test cases attachment with id: ${testCases.id}")

        if (testCases.contentType != "text/csv") {
            throw BusinessException("Test cases file must be a CSV file")
        }

        val bytes = attachmentBucket.download(testCases)
        val csvReader = CSVReader(InputStreamReader(ByteArrayInputStream(bytes)))
        val rows = csvReader.readAll()

        if (rows.isEmpty()) {
            throw BusinessException("Test cases file is empty")
        }

        rows.forEachIndexed { index, row ->
            if (row.size != 2) {
                throw BusinessException("Test case #${index + 1} does not have exactly input and output columns")
            }
        }

        logger.info("Finished validating test cases attachment")
    }
}
