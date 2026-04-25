package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class BuildGuestDashboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val frozenSubmissionRepository = mockk<FrozenSubmissionRepository>(relaxed = true)
        val leaderboardBuilder = mockk<LeaderboardBuilder>(relaxed = true)

        val sut =
            BuildGuestDashboardService(
                contestRepository = contestRepository,
                submissionRepository = submissionRepository,
                frozenSubmissionRepository = frozenSubmissionRepository,
                leaderboardBuilder = leaderboardBuilder,
            )

        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("should throw NotFoundException if contest is not found") {
            every { contestRepository.findById(contestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should throw NotFoundException if guest dashboard is not enabled") {
            val contest = ContestMockBuilder.build(settings = Contest.Settings(isGuestEnabled = false))
            every { contestRepository.findById(contestId) } returns contest

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should build guest dashboard successfully") {
            val contest = ContestMockBuilder.build(frozenAt = null)
            val leaderboard = LeaderboardMockBuilder.build()
            val submissions = listOf(SubmissionMockBuilder.build())
            every { contestRepository.findById(contestId) } returns contest
            every { leaderboardBuilder.build(any()) } returns leaderboard
            every { submissionRepository.findAllByContestId(contest.id) } returns submissions

            val dashboard = sut.execute()

            dashboard.contest shouldBe contest.toResponseBodyDTO()
            dashboard.leaderboard shouldBe leaderboard.toResponseBodyDTO()
            dashboard.members shouldBe contest.members.map { it.toResponseBodyDTO() }
            dashboard.problems shouldBe contest.problems.map { it.toResponseBodyDTO() }
            dashboard.submissions shouldBe submissions.map { it.toResponseBodyDTO() }
            dashboard.clarifications shouldBe contest.clarifications.map { it.toResponseBodyDTO() }
            dashboard.announcements shouldBe contest.announcements.map { it.toResponseBodyDTO() }
        }

        test("should build guest dashboard with frozen submissions") {
            val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusHours(1))
            val leaderboard = LeaderboardMockBuilder.build()
            val submissions = listOf(SubmissionMockBuilder.build().freeze())
            every { contestRepository.findById(contestId) } returns contest
            every { leaderboardBuilder.build(any()) } returns leaderboard
            every { frozenSubmissionRepository.findAllByContestId(contest.id) } returns submissions

            val dashboard = sut.execute()

            dashboard.submissions shouldBe submissions.map { it.unfreeze().toResponseBodyDTO() }
        }
    })
