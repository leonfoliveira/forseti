package com.forsetijudge.core.port.driven.queue

import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload

/**
 * A specialized [QueueProducer] for producing messages to a submission processing queue.
 *
 * This producer is used to send submission data to a queue for asynchronous processing. The payload contains the necessary information about the submission, such as the submission ID, problem ID, and other relevant details.
 */
interface SubmissionQueueProducer : QueueProducer<SubmissionQueuePayload>
