package com.forsetijudge.core.application.helper.outbox

import com.forsetijudge.core.application.helper.outbox.OutboxEventPublisher
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.repository.OutboxEventRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class OutboxEventPublisherTest :
    FunSpec({
        val outboxEventRepository = mockk<OutboxEventRepository>(relaxed = true)
        val objectMapper = JacksonConfig().objectMapper()

        val sut =
            OutboxEventPublisher(
                outboxEventRepository = outboxEventRepository,
                objectMapper = objectMapper,
            )

        beforeEach {
            clearAllMocks()
        }

        test("execute should save the outbox event to the repository") {
            val event = AnnouncementEvent.Created(announcementId = IdGenerator.getUUID())
            every { outboxEventRepository.save(any()) } returnsArgument 0

            sut.publish(event = event)

            verify {
                outboxEventRepository.save(
                    match {
                        it.eventType == event::class.java.name &&
                            it.payload == objectMapper.writeValueAsString(event)
                    },
                )
            }
        }
    })
