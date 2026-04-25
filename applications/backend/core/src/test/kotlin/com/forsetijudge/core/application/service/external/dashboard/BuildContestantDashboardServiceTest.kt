package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.service.internal.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.io.Serializable
import java.time.OffsetDateTime

class BuildContestantDashboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val frozenSubmissionRepository = mockk<FrozenSubmissionRepository>(relaxed = true)
        val ticketRepository = mockk<TicketRepository>(relaxed = true)
        val leaderboardBuilder = mockk<LeaderboardBuilder>(relaxed = true)

        val sut =
            BuildContestantDashboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                submissionRepository = submissionRepository,
                frozenSubmissionRepository = frozenSubmissionRepository,
                ticketRepository = ticketRepository,
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

        test("should throw NotFoundException if member is not found") {
            every { contestRepository.findById(contestId) } returns ContestMockBuilder.build()
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should throw ForbiddenException if member is not contestant") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.JUDGE)
            every { contestRepository.findById(contestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns member

            shouldThrow<ForbiddenException> {
                sut.execute()
            }
        }

        test("should build contestant dashboard successfully") {
            val contest = ContestMockBuilder.build(frozenAt = null)
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            val leaderboard = LeaderboardMockBuilder.build()
            val submissions = listOf(SubmissionMockBuilder.build())
            val memberSubmissions = listOf(SubmissionMockBuilder.build(member = member))
            val memberTickets = listOf(TicketMockBuilder.build<Serializable>(member = member))
            every { contestRepository.findById(contestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns member
            every { leaderboardBuilder.build(any()) } returns leaderboard
            every { submissionRepository.findAllByContestId(contest.id) } returns submissions
            every { submissionRepository.findAllByContestIdAndMemberId(contest.id, memberId) } returns memberSubmissions
            every { ticketRepository.findAllByContestIdAndMemberId(contest.id, memberId) } returns memberTickets

            val dashboard = sut.execute()

            dashboard.contest shouldBe contest.toResponseBodyDTO()
            dashboard.leaderboard shouldBe leaderboard.toResponseBodyDTO()
            dashboard.members shouldBe contest.members.map { it.toResponseBodyDTO() }
            dashboard.problems shouldBe contest.problems.map { it.toResponseBodyDTO() }
            dashboard.submissions shouldBe submissions.map { it.toResponseBodyDTO() }
            dashboard.memberSubmissions shouldBe memberSubmissions.map { it.toWithCodeResponseBodyDTO() }
            dashboard.clarifications shouldBe contest.clarifications.map { it.toResponseBodyDTO() }
            dashboard.announcements shouldBe contest.announcements.map { it.toResponseBodyDTO() }
            dashboard.memberTickets shouldBe memberTickets.map { it.toResponseBodyDTO() }
        }

        test("should unfreeze submissions if contest is frozen") {
            val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusHours(1))
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            val leaderboard = LeaderboardMockBuilder.build()
            val frozenSubmissions = listOf(SubmissionMockBuilder.build().freeze())
            val memberSubmissions = listOf(SubmissionMockBuilder.build(member = member))
            val memberTickets = listOf(TicketMockBuilder.build<Serializable>(member = member))
            every { contestRepository.findById(contestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns member
            every { leaderboardBuilder.build(any()) } returns leaderboard
            every { frozenSubmissionRepository.findAllByContestId(contest.id) } returns frozenSubmissions
            every { submissionRepository.findAllByContestIdAndMemberId(contest.id, memberId) } returns memberSubmissions
            every { ticketRepository.findAllByContestIdAndMemberId(contest.id, memberId) } returns memberTickets

            val dashboard = sut.execute()

            dashboard.submissions shouldBe frozenSubmissions.map { it.unfreeze().toResponseBodyDTO() }
        }
    })
