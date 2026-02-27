package com.forsetijudge.api.application.listener

import com.forsetijudge.core.application.listener.ApplicationEventListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.application.util.UnitUtil
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driven.job.AttachmentBucketCleanerJobScheduler
import com.forsetijudge.core.port.driven.job.payload.AttachmentBucketCleanerJobPayload
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.toJavaDuration

@Component
class ApplicationReadyEventListener(
    private val updateMemberPasswordUseCase: UpdateMemberPasswordUseCase,
    private val attachmentBucketCleanerJobScheduler: AttachmentBucketCleanerJobScheduler,
    @Value("\${security.root.password}")
    private val rootPassword: String,
    @Value("\${jobs.attachment-bucket-cleaner.id}")
    private val attachmentBucketCleanerJobId: String,
    @Value("\${jobs.attachment-bucket-cleaner.interval}")
    private val attachmentBucketCleanerJobInterval: String,
) : ApplicationEventListener() {
    private val logger = SafeLogger(this::class)

    /**
     * Updates the root user's password when the application is ready.
     */
    @EventListener(ApplicationReadyEvent::class)
    @Suppress("unused")
    fun onApplicationReady(event: ApplicationReadyEvent) {
        super.onApplicationEvent(event)

        try {
            updateMemberPasswordUseCase.execute(
                UpdateMemberPasswordUseCase.Command(
                    memberId = Member.Companion.ROOT_ID,
                    password = rootPassword,
                ),
            )
        } catch (_: ObjectOptimisticLockingFailureException) {
            logger.warn(
                "Skipping root password update due to optimistic locking failure. " +
                    "This may occur if another instance has already updated the password.",
            )
        } catch (ex: Exception) {
            logger.error("Failed to update root password", ex)
        }

        try {
            val attachmentBucketCleanerJobIntervalMillis =
                UnitUtil
                    .parseTimeValue(
                        attachmentBucketCleanerJobInterval,
                    ).milliseconds
                    .toJavaDuration()
            attachmentBucketCleanerJobScheduler.schedule(
                id = attachmentBucketCleanerJobId,
                payload = AttachmentBucketCleanerJobPayload(),
                interval = attachmentBucketCleanerJobIntervalMillis,
                startAt = OffsetDateTime.now().plus(attachmentBucketCleanerJobIntervalMillis),
            )
        } catch (ex: Exception) {
            logger.error(
                "Failed to schedule AttachmentBucketCleanerJob with interval '$attachmentBucketCleanerJobInterval'",
                ex,
            )
        }
    }
}
