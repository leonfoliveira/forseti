package live.forseti.core.port.driven

import live.forseti.core.domain.entity.Submission

interface SubmissionQueueProducer {
    /**
     * Enqueue a submission to be judged by the autojudge service
     *
     * @param submission the submission to be judged
     */
    fun produce(submission: Submission)
}
