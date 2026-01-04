package com.forsetijudge.core.application.service.announcement

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementCreatedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.AnnouncementRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.dto.input.announcement.CreateAnnouncementInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class CreateAnnouncementServiceTest :
    FunSpec({
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

        val contestId = UuidCreator.getTimeOrderedEpoch()
        val memberId = UuidCreator.getTimeOrderedEpoch()

        context("create") {
            test("should throw NotFoundException when contest does not exist") {
                val input = CreateAnnouncementInputDTO(text = "Test Announcement")
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find contest with id $contestId"
            }

            test("should throw NotFoundException when member does not exist in contest") {
                val input = CreateAnnouncementInputDTO(text = "Test Announcement")
                val contest = ContestMockBuilder.build()
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find member with id $memberId"
            }

            test("should create announcement successfully") {
                val input = CreateAnnouncementInputDTO(text = "Test Announcement")
                val member = MemberMockBuilder.build(id = memberId)
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { announcementRepository.save(any<Announcement>()) } answers { firstArg() }

                val announcement = sut.create(contestId, memberId, input)

                announcement.text shouldBe input.text
                announcement.contest.id shouldBe contestId
                announcement.member.id shouldBe memberId
                verify { announcementRepository.save(announcement) }
                val eventSlot = slot<AnnouncementCreatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.announcement shouldBe announcement
            }
        }
    })
