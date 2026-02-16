package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
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
import io.mockk.mockkConstructor
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class FindContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)

        val sut = FindContestService(contestRepository, memberRepository)

        val now = OffsetDateTime.now()
        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType(*anyVararg<Member.Type>()) } returns contestAuthorizer
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
        }
    })
