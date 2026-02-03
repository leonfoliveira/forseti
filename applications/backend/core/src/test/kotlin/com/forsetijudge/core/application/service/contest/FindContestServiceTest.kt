package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class FindContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)

        val sut = FindContestService(contestRepository, memberRepository)

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        context("findAll") {
            test("should return all contests") {
                val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
                every { contestRepository.findAll() } returns contests

                val result = sut.findAll()

                result shouldBe contests
            }
        }

        context("findById") {
            val id = UuidCreator.getTimeOrderedEpoch()

            test("should throw NotFoundException if contest not found") {
                every { contestRepository.findEntityById(id) } returns null

                shouldThrow<NotFoundException> {
                    sut.findById(id)
                }.message shouldBe "Could not find contest with id = $id"
            }

            test("should return contest by id") {
                val contest = ContestMockBuilder.build(id = id)
                every { contestRepository.findEntityById(id) } returns contest

                val result = sut.findById(contest.id)

                result shouldBe contest
            }
        }

        context("findBySlug") {
            val slug = "test-contest"

            test("should throw NotFoundException if contest not found") {
                every { contestRepository.findBySlug(slug) } returns null

                shouldThrow<NotFoundException> {
                    sut.findBySlug(slug)
                }.message shouldBe "Could not find contest with slug = $slug"
            }

            test("should return contest by slug") {
                val contest = ContestMockBuilder.build(slug = slug)
                every { contestRepository.findBySlug(slug) } returns contest

                val result = sut.findBySlug(slug)

                result shouldBe contest
            }
        }

        context("findByIdPublic") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val memberId = UuidCreator.getTimeOrderedEpoch()

            test("should throw NotFoundException if contest not found") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findByIdPublic(memberId, contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw NotFoundException if member not found") {
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findByIdPublic(memberId, contestId)
                }.message shouldBe "Could not find member with id = $memberId"
            }

            test("should throw ForbiddenException when contest has not started and member is not ADMIN/ROOT") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2)
                )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.findByIdPublic(memberId, contestId)
                }.message shouldBe "Contest has not started yet"
            }

            test("should return contest when contest has started for any member") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().minusHours(1),
                    endAt = OffsetDateTime.now().plusHours(1)
                )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                val result = sut.findByIdPublic(memberId, contestId)

                result shouldBe contest
            }

            test("should return contest when contest has not started but member is ADMIN") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.ADMIN)
                val contest = ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2)
                )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                val result = sut.findByIdPublic(memberId, contestId)

                result shouldBe contest
            }

            test("should return contest when contest has not started but member is ROOT") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.ROOT)
                val contest = ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2)
                )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                val result = sut.findByIdPublic(memberId, contestId)

                result shouldBe contest
            }

            test("should return contest when member is null and contest has started") {
                val contest = ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().minusHours(1),
                    endAt = OffsetDateTime.now().plusHours(1)
                )
                every { contestRepository.findEntityById(contestId) } returns contest

                val result = sut.findByIdPublic(null, contestId)

                result shouldBe contest
            }

            test("should throw ForbiddenException when member is null and contest has not started") {
                val contest = ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2)
                )
                every { contestRepository.findEntityById(contestId) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.findByIdPublic(null, contestId)
                }.message shouldBe "Contest has not started yet"
            }
        }
    })
