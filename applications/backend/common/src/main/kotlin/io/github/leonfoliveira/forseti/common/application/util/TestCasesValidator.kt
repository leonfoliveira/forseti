package io.github.leonfoliveira.forseti.common.application.util

import com.opencsv.CSVReader
import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.domain.exception.BusinessException
import io.github.leonfoliveira.forseti.common.application.port.driven.AttachmentBucket
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.io.ByteArrayInputStream
import java.io.InputStreamReader

@Component
class TestCasesValidator(
    private val attachmentBucket: AttachmentBucket,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
