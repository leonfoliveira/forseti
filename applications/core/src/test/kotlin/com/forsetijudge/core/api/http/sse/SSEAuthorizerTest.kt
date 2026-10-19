package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.application.TestAuthentication
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.IdGenerator
import java.time.OffsetDateTime
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class SSEAuthorizerTest {
    private val contestRepository = mock<ContestRepository>()
    private val memberResponseDTO = mock<MemberRepository>()
    private val service = SSEAuthorizer(contestRepository, memberResponseDTO)

    @AfterEach
    fun tearDown() = TestAuthentication.clear()

    @Nested
    inner class AuthorizeToAdminDashboardRoomTest {
        @Test
        fun `should throw NotFoundException when contest is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.ADMIN)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToAdminDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw NotFoundException when member is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.ADMIN)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(MockEntityFactory.contest())
            whenever(memberResponseDTO.findByIdAndContestIdOrContestIsNull(any(), any())).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToAdminDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member(type = Member.Type.ADMIN, contest = MockEntityFactory.contest())
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestIdOrContestIsNull(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToAdminDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member is not ROOT or ADMIN`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = contest)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestIdOrContestIsNull(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToAdminDashboardRoom(contestId)
            }
        }
    }

    @Nested
    inner class AuthorizeToJudgeDashboardRoomTest {
        @Test
        fun `should throw NotFoundException when contest is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.JUDGE)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToJudgeDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw NotFoundException when member is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.JUDGE)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(MockEntityFactory.contest())
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToJudgeDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member(type = Member.Type.JUDGE, contest = MockEntityFactory.contest())
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToJudgeDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member is not JUDGE`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = contest)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToJudgeDashboardRoom(contestId)
            }
        }
    }

    @Nested
    inner class AuthorizeToStaffDashboardRoomTest {
        @Test
        fun `should throw NotFoundException when contest is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.STAFF)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToStaffDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw NotFoundException when member is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.STAFF)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(MockEntityFactory.contest())
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToStaffDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member(type = Member.Type.STAFF, contest = MockEntityFactory.contest())
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToStaffDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member is not STAFF`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest()
            val member = MockEntityFactory.member(type = Member.Type.CONTESTANT, contest = contest)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToStaffDashboardRoom(contestId)
            }
        }
    }

    @Nested
    inner class AuthorizeToContestantDashboardRoomTest {
        @Test
        fun `should throw NotFoundException when contest is not found`() {
            val contestId = IdGenerator.getUUID()
            val member = MockEntityFactory.member(type = Member.Type.CONTESTANT)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToContestantDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw NotFoundException when member is not found`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1))
            val member = MockEntityFactory.member(type = Member.Type.CONTESTANT)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToContestantDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1))
            val member =
                MockEntityFactory.member(
                    type = Member.Type.CONTESTANT,
                    contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1)),
                )
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToContestantDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when member is not CONTESTANT`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1))
            val member = MockEntityFactory.member(type = Member.Type.JUDGE, contest = contest)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToContestantDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when contest has not started`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
            val member = MockEntityFactory.member(type = Member.Type.CONTESTANT)
            TestAuthentication.setMember(member)
            whenever(contestRepository.findById(contestId)).thenReturn(contest)
            whenever(memberResponseDTO.findByIdAndContestId(any(), any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToContestantDashboardRoom(contestId)
            }
        }
    }

    @Nested
    inner class AuthorizeToSpectatorDashboardRoom {
        @Test
        fun `should throw NotFoundException when contest is not found`() {
            val contestId = IdGenerator.getUUID()
            whenever(contestRepository.findById(contestId)).thenReturn(null)

            assertThrows<NotFoundException> {
                service.authorizeToSpectatorDashboardRoom(contestId)
            }
        }

        @Test
        fun `should throw ForbiddenException when contest has not started`() {
            val contestId = IdGenerator.getUUID()
            val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
            whenever(contestRepository.findById(contestId)).thenReturn(contest)

            assertThrows<ForbiddenException> {
                service.authorizeToSpectatorDashboardRoom(contestId)
            }
        }
    }

    @Nested
    inner class AuthorizeToMemberPrivateRoomTest {
        @Test
        fun `should throw ForbiddenException when member is not authorized`() {
            val member = MockEntityFactory.member()
            TestAuthentication.setMember(member)
            whenever(memberResponseDTO.findById(any())).thenReturn(member)

            assertThrows<ForbiddenException> {
                service.authorizeToMemberPrivateRoom(IdGenerator.getUUID())
            }
        }
    }
}
