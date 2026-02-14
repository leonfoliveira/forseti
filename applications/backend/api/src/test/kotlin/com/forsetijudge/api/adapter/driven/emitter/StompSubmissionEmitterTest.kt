package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.submission.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.submission.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.port.driven.WebSocketFanoutProducer
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class StompSubmissionEmitterTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut =
            StompSubmissionEmitter(webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should emmit submission events") {
            val submission = SubmissionMockBuilder.build()

            sut.emit(submission)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${submission.contest.id}/submissions",
                    submission.toPublicResponseDTO(),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${submission.contest.id}/submissions/full",
                    submission.toFullResponseDTO(),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${submission.contest.id}/submissions/full/members/${submission.member.id}",
                    submission.toFullResponseDTO(),
                )
            }
        }

        test("should not emmit public submission event if contest is frozen") {
            val contest =
                ContestMockBuilder.build(
                    autoFreezeAt = OffsetDateTime.now().minusMinutes(2),
                    manualFreezeAt = null,
                    unfreezeAt = null,
                )
            val submission = SubmissionMockBuilder.build(problem = ProblemMockBuilder.build(contest = contest))

            sut.emit(submission)

            verify(exactly = 0) {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${submission.contest.id}/submissions",
                    submission.toPublicResponseDTO(),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${submission.contest.id}/submissions/full",
                    submission.toFullResponseDTO(),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${submission.contest.id}/submissions/full/members/${submission.member.id}",
                    submission.toFullResponseDTO(),
                )
            }
        }
    })
