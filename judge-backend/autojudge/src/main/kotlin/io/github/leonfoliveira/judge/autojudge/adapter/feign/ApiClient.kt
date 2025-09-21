package io.github.leonfoliveira.judge.autojudge.adapter.feign

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import java.util.UUID

@FeignClient(name = "apiClient", url = "\${external.api.url}", configuration = [FeignConfig::class])
interface ApiClient {
    @PutMapping("/v1/contests/{contestId}/submissions/{submissionId}/answer/{answer}")
    fun updateSubmissionAnswer(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @PathVariable answer: Submission.Answer,
    )
}
