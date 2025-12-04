package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime
import java.util.UUID

class DeleteContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)

        val sut =
            DeleteContestService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                problemRepository = problemRepository,
            )

        beforeEach {
            clearAllMocks()
        }

        context("delete") {
            val id = UUID.randomUUID()

            test("should throw NotFoundException when contest does not exist") {
                every { contestRepository.findEntityById(id) } returns null

                shouldThrow<NotFoundException> {
                    sut.delete(id)
                }.message shouldBe "Could not find contest with id = $id"
            }

            test("should throw ForbiddenException when contest has started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(id) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.delete(id)
                }.message shouldBe "Contest already started"
            }

            test("should delete contest when it has not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                every { contestRepository.findEntityById(id) } returns contest
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                sut.delete(id)

                contest.deletedAt shouldNotBe null
                verify { contestRepository.save(contest) }
            }
        }

        context("deleteMembers") {
            val members = listOf(MemberMockBuilder.build(), MemberMockBuilder.build())

            test("should delete members") {
                every { memberRepository.saveAll(members) } answers { firstArg() }

                sut.deleteMembers(members)

                members.forEach { it.deletedAt shouldNotBe null }
                verify { memberRepository.saveAll(members) }
            }
        }

        context("deleteProblems") {
            val problems = listOf(ProblemMockBuilder.build(), ProblemMockBuilder.build())

            test("should delete problems") {
                every { problemRepository.saveAll(problems) } answers { firstArg() }

                sut.deleteProblems(problems)

                problems.forEach { it.deletedAt shouldNotBe null }
                verify { problemRepository.saveAll(problems) }
            }
        }
    })
