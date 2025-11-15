package io.github.leonfoliveira.forseti.common.application.service.clarification

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import io.github.leonfoliveira.forseti.common.application.domain.event.ClarificationDeletedEvent
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ClarificationRepository
import io.github.leonfoliveira.forseti.common.mock.entity.ClarificationMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID

class DeleteClarificationServiceTest :
    FunSpec({
        val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            DeleteClarificationService(
                clarificationRepository = clarificationRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
        }

        context("delete") {
            val id = UUID.randomUUID()

            test("should throw NotFoundException when clarification does not exist") {
                every { clarificationRepository.findEntityById(id) } returns null

                shouldThrow<NotFoundException> {
                    sut.delete(id)
                }.message shouldBe "Could not find clarification with id $id"
            }

            test("should delete clarification and its children") {
                val answer = ClarificationMockBuilder.build()
                val clarification = ClarificationMockBuilder.build(children = listOf(answer))
                every { clarificationRepository.findEntityById(id) } returns clarification
                every { clarificationRepository.save(any<Clarification>()) } answers { firstArg() }

                sut.delete(id)

                clarification.deletedAt shouldNotBe null
                clarificationRepository.save(clarification)
                val eventSlot = slot<ClarificationDeletedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.clarification shouldBe clarification
            }
        }
    })
