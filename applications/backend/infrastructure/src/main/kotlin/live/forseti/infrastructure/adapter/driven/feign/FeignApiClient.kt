package live.forseti.infrastructure.adapter.driven.feign

import live.forseti.core.port.driven.ApiClient
import live.forseti.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import java.util.UUID

@FeignClient(name = "apiClient", url = "\${external.api.url}", configuration = [FeignConfig::class])
interface FeignApiClient : ApiClient {
    /**
     * Request to update submission answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission.
     * @param body The request body containing the new answer for the submission.
     */
    @PutMapping("/v1/contests/{contestId}/submissions/{submissionId}:update-answer")
    override fun updateSubmissionAnswer(
        @PathVariable contestId: UUID,
        @PathVariable submissionId: UUID,
        @RequestBody body: UpdateSubmissionAnswerRequestDTO,
    )
}
