package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.time.OffsetDateTime

@ActiveProfiles("test")
@SpringBootTest(classes = [ContestUpdatedEventListener::class])
class ContestUpdatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val autoFreezeJobScheduler: AutoFreezeJobScheduler,
    private val sut: ContestUpdatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully to freeze") {
            val contest = ContestMockBuilder.build(autoFreezeAt = OffsetDateTime.now())
            val event = ContestEvent.Updated(contest)

            sut.onApplicationEvent(event)

            verify {
                autoFreezeJobScheduler.schedule(
                    id = "freeze-contest-${contest.id}",
                    payload =
                        com.forsetijudge.core.port.driven.job.payload
                            .AutoFreezeJobPayload(contest.id),
                    at = contest.autoFreezeAt!!,
                )
            }
        }

        test("should handle event successfully to not freeze") {
            val contest = ContestMockBuilder.build(autoFreezeAt = null)
            val event = ContestEvent.Updated(contest)

            sut.onApplicationEvent(event)

            verify {
                autoFreezeJobScheduler.cancel("freeze-contest-${contest.id}")
            }
        }
    })
