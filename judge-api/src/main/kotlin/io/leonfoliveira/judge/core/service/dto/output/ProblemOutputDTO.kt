package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter

data class ProblemOutputDTO(
    val id: Int,
    val title: String,
    val description: String,
    val timeLimit: Int,
    val testCases: DownloadAttachment,
)

fun Problem.toOutputDTO(bucketAdapter: BucketAdapter): ProblemOutputDTO {
    return ProblemOutputDTO(
        id = this.id,
        title = this.title,
        description = this.description,
        timeLimit = this.timeLimit,
        testCases = bucketAdapter.createDownloadAttachment(this.testCases),
    )
}
