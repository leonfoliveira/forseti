package io.leonfoliveira.judge.core.util

import com.opencsv.CSVReader
import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.leonfoliveira.judge.core.port.BucketAdapter
import java.io.ByteArrayInputStream
import java.io.InputStreamReader
import org.springframework.stereotype.Component

@Component
class TestCasesValidator(
    private val bucketAdapter: BucketAdapter,
) {
    fun validate(testCases: Attachment) {
        if (testCases.contentType != "text/csv") {
            throw BusinessException("Test cases file must be a CSV file")
        }

        val bytes = bucketAdapter.download(testCases.key)
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
    }
}