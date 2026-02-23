package com.forsetijudge.core.application.service.external.announcement

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.AnnouncementRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.announcement.CreateAnnouncementUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
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

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        val command =
            CreateAnnouncementUseCase.Command(
                text = "Announcement text",
            )

        test("should throw NotFoundException if contest does not exist") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException if member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        Member.Type.entries.filterNot { it == Member.Type.ROOT || it == Member.Type.ADMIN }.forEach { memberType ->
            test("should throw ForbiddenException if member is of type $memberType") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(contest = contest, type = memberType)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }
        }

        test("should create announcement successfully") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(contest = contest, type = Member.Type.ADMIN)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { announcementRepository.save(any()) } returnsArgument 0

            val announcement = sut.execute(command)

            announcement.contest shouldBe contest
            announcement.member shouldBe member
            announcement.text shouldBe command.text
            verify { announcementRepository.save(announcement) }
            verify { applicationEventPublisher.publishEvent(match<AnnouncementEvent.Created> { it.payload == announcement }) }
        }
    })
