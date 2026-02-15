package com.forsetijudge.infrastructure.adapter.driven.scheduler

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import com.forsetijudge.infrastructure.adapter.driving.job.QuartzJob
import com.forsetijudge.infrastructure.adapter.dto.job.payload.AutoFreezeJobPayload
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.assertThrows
import java.time.OffsetDateTime

class AutoFreezeQuartzJobSchedulerTest :
    FunSpec({
        val quartzJobScheduler = mockk<QuartzJobScheduler>(relaxed = true)

        val sut = AutoFreezeQuartzJobScheduler(quartzJobScheduler)

        context("schedule") {
            test("should throw BusinessException if autoFreezeAt is null") {
                val contest = ContestMockBuilder.build(autoFreezeAt = null)

                assertThrows<BusinessException> {
                    sut.schedule(contest)
                }
            }

            test("should throw BusinessException if autoFreezeAt is in the past") {
                val contest = ContestMockBuilder.build(autoFreezeAt = OffsetDateTime.now().minusDays(1))

                assertThrows<BusinessException> {
                    sut.schedule(contest)
                }
            }

            test("should schedule auto-freeze job successfully") {
                val contest = ContestMockBuilder.build(autoFreezeAt = OffsetDateTime.now().plusDays(1))

                sut.schedule(contest)

                @Suppress("UNCHECKED_CAST")
                verify {
                    quartzJobScheduler.schedule(
                        match {
                            it.id == contest.id.toString() &&
                                it.payload.contestId == contest.id
                        },
                        AutoFreezeQuartzJob::class.java as Class<QuartzJob<AutoFreezeJobPayload>>,
                        contest.autoFreezeAt!!,
                    )
                }
            }
        }

        context("cancel") {
            test("should cancel auto-freeze job successfully") {
                val contest = ContestMockBuilder.build()

                sut.cancel(contest)

                verify { quartzJobScheduler.cancel(contest.id.toString()) }
            }
        }
    })
