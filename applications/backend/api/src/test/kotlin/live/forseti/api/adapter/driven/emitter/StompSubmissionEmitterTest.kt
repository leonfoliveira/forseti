package live.forseti.api.adapter.driven.emitter

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import live.forseti.api.adapter.dto.response.submission.toFullResponseDTO
import live.forseti.api.adapter.dto.response.submission.toPublicResponseDTO
import live.forseti.core.domain.entity.SubmissionMockBuilder
import live.forseti.core.port.driven.WebSocketFanoutProducer

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
    })
