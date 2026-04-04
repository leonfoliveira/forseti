package com.forsetijudge.core.application.service.external.outbox

import com.forsetijudge.core.application.listener.announcement.AnnouncementCreatedEventListener
import com.forsetijudge.core.application.listener.clarification.ClarificationCreatedEventListener
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.OutboxEvent
import com.forsetijudge.core.domain.entity.OutboxEventMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.OutboxEventRepository
import com.forsetijudge.core.port.driving.usecase.external.outbox.ExecuteOutboxEventUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class ExecuteOutboxEventServiceTest :
    FunSpec({
        val outboxEventRepository = mockk<OutboxEventRepository>(relaxed = true)
        val objectMapper = JacksonConfig().objectMapper()
        val announcementCreatedEventListener = mockk<AnnouncementCreatedEventListener>(relaxed = true)
        val clarificationCreatedEventListener = mockk<ClarificationCreatedEventListener>(relaxed = true)
        val listeners =
            listOf(
                announcementCreatedEventListener,
                clarificationCreatedEventListener,
            )

        val sut =
            ExecuteOutboxEventService(
                outboxEventRepository = outboxEventRepository,
                objectMapper = objectMapper,
                listener = listeners,
            )

        beforeEach {
            clearAllMocks()
        }

        val command = ExecuteOutboxEventUseCase.Command(id = IdGenerator.getUUID())

        test("should throw NotFoundException when outbox event is not found") {
            every { outboxEventRepository.findById(command.id) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should skip execution is status is not pending") {
            every { outboxEventRepository.findById(command.id) } returns
                OutboxEventMockBuilder.build(
                    status = OutboxEvent.Status.PROCESSED,
                )

            sut.execute(command)

            verify(exactly = 0) { announcementCreatedEventListener.handle(any()) }
            verify(exactly = 0) { clarificationCreatedEventListener.handle(any()) }
        }

        test("should skip execution if no listener is found for the event type") {
            every { outboxEventRepository.findById(command.id) } returns
                OutboxEventMockBuilder.build(
                    eventType = "UnknownEvent",
                )

            sut.execute(command)

            verify(exactly = 0) { announcementCreatedEventListener.handle(any()) }
            verify(exactly = 0) { clarificationCreatedEventListener.handle(any()) }
        }

        test("should execute outbox event successfully") {
            val outboxEvent = OutboxEventMockBuilder.build()
            every { outboxEventRepository.findById(command.id) } returns outboxEvent
            every { outboxEventRepository.save(any()) } returnsArgument 0

            sut.execute(command)

            verify(exactly = 1) {
                announcementCreatedEventListener.handle(
                    objectMapper.readValue(outboxEvent.payload, AnnouncementEvent.Created::class.java),
                )
            }
            verify(exactly = 0) { clarificationCreatedEventListener.handle(any()) }
            outboxEvent.status shouldBe OutboxEvent.Status.PROCESSED
            verify { outboxEventRepository.save(outboxEvent) }
        }
    })
