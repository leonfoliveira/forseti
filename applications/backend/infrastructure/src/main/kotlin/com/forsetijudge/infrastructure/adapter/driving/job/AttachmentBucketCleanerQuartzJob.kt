package com.forsetijudge.infrastructure.adapter.driving.job

import com.forsetijudge.core.port.driving.usecase.external.attachment.CleanUncommitedAttachmentsUseCase
import com.forsetijudge.infrastructure.adapter.dto.quartz.payload.AttachmentBucketCleanerJobPayload
import org.springframework.stereotype.Component

@Component
class AttachmentBucketCleanerQuartzJob(
    private val cleanAttachmentBucketUseCase: CleanUncommitedAttachmentsUseCase,
) : QuartzJob<AttachmentBucketCleanerJobPayload>() {
    override fun getPayloadType(): Class<AttachmentBucketCleanerJobPayload> = AttachmentBucketCleanerJobPayload::class.java

    /**
     * Handles the payload for the AttachmentBucketCleanerJob by calling the clean method of the CleanUncommitedAttachmentsUseCase.
     *
     * @param payload The payload for the job, which is not used in this case since the job does not require any specific data to perform its task.
     */
    override fun handlePayload(payload: AttachmentBucketCleanerJobPayload) {
        logger.info("Handling AttachmentBucketCleanerQuartzJob")

        cleanAttachmentBucketUseCase.execute()

        logger.info("Finished handling AttachmentBucketCleanerQuartzJob")
    }
}
