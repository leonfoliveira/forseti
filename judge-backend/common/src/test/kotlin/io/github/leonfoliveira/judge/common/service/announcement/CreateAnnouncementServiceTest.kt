package io.github.leonfoliveira.judge.common.service.announcement

import io.github.leonfoliveira.judge.common.domain.entity.Announcement
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.AnnouncementEvent
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.repository.AnnouncementRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.service.dto.input.announcement.CreateAnnouncementInputDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.util.Optional
import java.util.UUID

class CreateAnnouncementServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>(relaxed = true)
    val memberRepository = mockk<MemberRepository>(relaxed = true)
    val announcementRepository = mockk<AnnouncementRepository>(relaxed = true)
    val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

    val sut =
        CreateAnnouncementService(
            contestRepository = contestRepository,
            memberRepository = memberRepository,
            announcementRepository = announcementRepository,
            applicationEventPublisher = applicationEventPublisher,
        )

    beforeEach {
        clearAllMocks()
    }

    val contestId = UUID.randomUUID()
    val memberId = UUID.randomUUID()

    context("create") {
        test("should throw NotFoundException when contest does not exist") {
            val input = CreateAnnouncementInputDTO(text = "Test Announcement")
            every { contestRepository.findById(contestId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.create(contestId, memberId, input)
            }.message shouldBe "Could not find contest with id $contestId"
        }

        test("should throw NotFoundException when member does not exist in contest") {
            val input = CreateAnnouncementInputDTO(text = "Test Announcement")
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contestId) } returns Optional.of(contest)
            every { memberRepository.findById(memberId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.create(contestId, memberId, input)
            }.message shouldBe "Could not find member with id $memberId"
        }

        test("should create announcement successfully") {
            val input = CreateAnnouncementInputDTO(text = "Test Announcement")
            val member = MemberMockBuilder.build(id = memberId)
            val contest = ContestMockBuilder.build(id = contestId)
            every { contestRepository.findById(contestId) } returns Optional.of(contest)
            every { memberRepository.findById(memberId) } returns Optional.of(member)
            every { announcementRepository.save(any<Announcement>()) } answers { firstArg() }

            val announcement = sut.create(contestId, memberId, input)

            announcement.text shouldBe input.text
            announcement.contest.id shouldBe contestId
            announcement.member.id shouldBe memberId
            verify { announcementRepository.save(announcement) }
            val eventSlot = slot<AnnouncementEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
            eventSlot.captured.announcement shouldBe announcement
        }
    }
})
