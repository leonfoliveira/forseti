package com.forsetijudge.api.application.listener

import com.forsetijudge.core.application.util.UnitUtil
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driven.job.AttachmentBucketCleanerJobScheduler
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.member.UpdateMemberPasswordUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.orm.ObjectOptimisticLockingFailureException
import kotlin.time.Duration.Companion.milliseconds

@SpringBootTest(classes = [ApplicationReadyEventListener::class])
class ApplicationReadyEventListenerTest(
    @MockkBean(relaxed = true)
    private val updateMemberPasswordUseCase: UpdateMemberPasswordUseCase,
    @MockkBean(relaxed = true)
    private val attachmentBucketCleanerJobScheduler: AttachmentBucketCleanerJobScheduler,
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @Value("\${security.root.password}")
    private val rootPassword: String,
    @Value("\${jobs.attachment-bucket-cleaner.id}")
    private val attachmentBucketCleanerJobId: String,
    @Value("\${jobs.attachment-bucket-cleaner.interval}")
    private val attachmentBucketCleanerJobInterval: String,
    private val sut: ApplicationReadyEventListener,
) : FunSpec({

        test("should update root password on application ready") {
            val event = mockk<ApplicationReadyEvent>()
            sut.onApplicationEvent(event)

            verify {
                updateMemberPasswordUseCase.execute(
                    UpdateMemberPasswordUseCase.Command(
                        memberId = Member.Companion.ROOT_ID,
                        password = rootPassword,
                    ),
                )
            }
        }

        test("should handle optimistic locking failure when updating root password") {
            val event = mockk<ApplicationReadyEvent>()
            every {
                updateMemberPasswordUseCase.execute(
                    UpdateMemberPasswordUseCase.Command(
                        memberId = Member.Companion.ROOT_ID,
                        password = rootPassword,
                    ),
                )
            } throws ObjectOptimisticLockingFailureException("Optimistic locking failure", null)
            every { authenticateSystemUseCase.execute(any()) } returns Unit

            shouldNotThrow<ObjectOptimisticLockingFailureException> {
                sut.onApplicationEvent(event)
            }
        }

        test("should schedule attachment bucket cleaner job on application ready") {
            every { authenticateSystemUseCase.execute(any()) } returns Unit
            val attachmentBucketCleanerJobIntervalMillis =
                UnitUtil
                    .parseTimeValue(
                        attachmentBucketCleanerJobInterval,
                    ).milliseconds

            val event = mockk<ApplicationReadyEvent>()
            sut.onApplicationEvent(event)

            verify {
                attachmentBucketCleanerJobScheduler.schedule(
                    interval = attachmentBucketCleanerJobIntervalMillis,
                )
            }
        }
    })
