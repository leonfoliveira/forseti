package com.forsetijudge.core.application.service.internal.outbox

import com.fasterxml.jackson.core.type.TypeReference
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.repository.OutboxEventRepository
import com.forsetijudge.core.port.driving.usecase.internal.outbox.PublishOutboxEventInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify

class PublishOutboxEventInternalServiceTest :
    FunSpec({
        val outboxEventRepository = mockk<OutboxEventRepository>(relaxed = true)
        val objectMapper = JacksonConfig().objectMapper()

        val sut =
            PublishOutboxEventInternalService(
                outboxEventRepository = outboxEventRepository,
                objectMapper = objectMapper,
            )

        test("execute should save the outbox event to the repository") {
            val event = AnnouncementEvent.Created(announcementId = IdGenerator.getUUID())

            sut.execute(
                PublishOutboxEventInternalUseCase.Command(
                    event = event,
                ),
            )

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
