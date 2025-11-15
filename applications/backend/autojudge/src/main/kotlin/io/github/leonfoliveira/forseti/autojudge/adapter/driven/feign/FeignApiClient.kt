package io.github.leonfoliveira.forseti.autojudge.adapter.driven.feign

import io.github.leonfoliveira.forseti.autojudge.application.port.driven.ApiClient
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import java.util.UUID

@FeignClient(name = "apiClient", url = "\${external.api.url}", configuration = [FeignConfig::class])
interface FeignApiClient : ApiClient {
    /**
     * Request to update submission answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission.
     * @param answer The new answer for the submission.
     */
    @PutMapping("/v1/contests/{contestId}/submissions/{submissionId}/answer/{answer}")
    override fun updateSubmissionAnswer(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @PathVariable answer: Submission.Answer,
    )
}
