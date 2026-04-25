package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class BuildLeaderboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val leaderboardBuilder = mockk<LeaderboardBuilder>(relaxed = true)

        val sut =
            BuildLeaderboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                leaderboardBuilder = leaderboardBuilder,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(BuildLeaderboardUseCase.Command()) }
        }

        test("should throw NotFoundException when member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(BuildLeaderboardUseCase.Command()) }
        }

        test("should throw ForbiddenException when member cannot access not started contest") {
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().plusHours(1),
                )
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> { sut.execute(BuildLeaderboardUseCase.Command()) }
        }

        test("should build leaderboard cells successfully") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
            val leaderboard = LeaderboardMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { leaderboardBuilder.build(any()) } returns leaderboard

            val result = sut.execute(BuildLeaderboardUseCase.Command())

            result shouldBe leaderboard.toResponseBodyDTO()
        }
    })
