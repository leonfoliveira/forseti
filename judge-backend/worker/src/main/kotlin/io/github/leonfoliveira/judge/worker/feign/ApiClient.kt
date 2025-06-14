package io.github.leonfoliveira.judge.worker.feign

import io.github.leonfoliveira.judge.core.domain.entity.Submission
import java.util.UUID
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping

@FeignClient(name = "apiClient", url = "\${external.api.url}", configuration = [FeignConfig::class])
interface ApiClient {
    @PutMapping("/v1/submissions/{id}/fail")
    fun failSubmission(
        @PathVariable id: UUID,
    )

    @PutMapping("/v1/submissions/{id}/answer/{answer}")
    fun updateSubmissionAnswer(
        @PathVariable id: UUID,
        @PathVariable answer: Submission.Answer,
    )
}
