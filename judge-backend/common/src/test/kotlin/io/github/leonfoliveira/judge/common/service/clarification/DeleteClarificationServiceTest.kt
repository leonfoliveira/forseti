package io.github.leonfoliveira.judge.common.service.clarification

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.ClarificationEvent
import io.github.leonfoliveira.judge.common.mock.entity.ClarificationMockBuilder
import io.github.leonfoliveira.judge.common.repository.ClarificationRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.Optional
import java.util.UUID
import org.springframework.context.ApplicationEventPublisher

class DeleteClarificationServiceTest : FunSpec({
    val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
    val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

    val sut = DeleteClarificationService(
        clarificationRepository = clarificationRepository,
        applicationEventPublisher = applicationEventPublisher,
    )

    beforeEach {
        clearAllMocks()
    }

    context("delete") {
        val id = UUID.randomUUID()

        test("should throw NotFoundException when clarification does not exist") {
            every { clarificationRepository.findById(id) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.delete(id)
            }.message shouldBe "Could not find clarification with id $id"
        }

        test("should delete clarification and its children") {
            val answer = ClarificationMockBuilder.build()
            val clarification = ClarificationMockBuilder.build(children = listOf(answer))
            every { clarificationRepository.findById(id) } returns Optional.of(clarification)
            every { clarificationRepository.save(any<Clarification>()) } answers { firstArg() }

            sut.delete(id)

            clarification.deletedAt shouldNotBe null
            answer.deletedAt shouldNotBe null
            clarificationRepository.save(clarification)
            val eventSlot = mutableListOf<ClarificationEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
            eventSlot[0].clarification shouldBe answer
            eventSlot[0].isDeleted shouldBe true
            eventSlot[1].clarification shouldBe clarification
            eventSlot[1].isDeleted shouldBe true
        }
    }
})
