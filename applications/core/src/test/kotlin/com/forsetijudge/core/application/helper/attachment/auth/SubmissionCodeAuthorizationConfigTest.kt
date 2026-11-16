package com.forsetijudge.core.application.helper.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows

class SubmissionCodeAuthorizationConfigTest {
    val config = SubmissionCodeAuthorizationConfig()

    val contest =
        MockEntityFactory.contest(
            startAt = OffsetDateTime.now().minusDays(1),
            endAt = OffsetDateTime.now().plusDays(1),
        )
    val member = MockEntityFactory.member(contest = contest)
    val attachment =
        MockEntityFactory.attachment(
            context = Attachment.Context.SUBMISSION_CODE,
            member = member,
        )

    @Nested
    inner class AuthorizeAdminUpload {
        @Test
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
                config.authorizeAdminUpload(contest, member)
            }
        }
    }

    @Nested
    inner class AuthorizeJudgeUpload {
        @Test
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
                config.authorizeJudgeUpload(contest, member)
            }
        }
    }

    @Nested
    inner class AuthorizeStaffUpload {
        @Test
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
                config.authorizeStaffUpload(contest, member)
            }
        }
    }

    @Nested
    inner class AuthorizeContestantUpload {
        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val otherMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
            assertThrows<ForbiddenException> {
                config.authorizeContestantUpload(contest, otherMember)
            }
        }

        @Test
        fun `should throw ForbiddenException when contest is not active`() {
            val inactiveContest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().plusDays(1),
                )
            val otherMember = MockEntityFactory.member(contest = inactiveContest)
            assertThrows<ForbiddenException> {
                config.authorizeContestantUpload(inactiveContest, otherMember)
            }
        }

        @Test
        fun `should not throw ForbiddenException when member belongs to contest and contest is active`() {
            assertDoesNotThrow {
                config.authorizeContestantUpload(contest, member)
            }
        }
    }

    @Nested
    inner class AuthorizeAdminDownload {
        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val otherMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
            assertThrows<ForbiddenException> {
                config.authorizeAdminDownload(contest, otherMember, attachment)
            }
        }

        @Test
        fun `should not throw ForbiddenException when member belongs to contest`() {
            assertDoesNotThrow {
                config.authorizeAdminDownload(contest, member, attachment)
            }
        }
    }

    @Nested
    inner class AuthorizeJudgeDownload {
        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val otherMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
            assertThrows<ForbiddenException> {
                config.authorizeJudgeDownload(contest, otherMember, attachment)
            }
        }

        @Test
        fun `should not throw ForbiddenException when member belongs to contest`() {
            assertDoesNotThrow {
                config.authorizeJudgeDownload(contest, member, attachment)
            }
        }
    }

    @Nested
    inner class AuthorizeStaffDownload {
        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val otherMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
            assertThrows<ForbiddenException> {
                config.authorizeStaffDownload(contest, otherMember, attachment)
            }
        }

        @Test
        fun `should not throw ForbiddenException when member belongs to contest`() {
            assertDoesNotThrow {
                config.authorizeStaffDownload(contest, member, attachment)
            }
        }
    }

    @Nested
    inner class AuthorizeContestantDownload {
        @Test
        fun `should throw ForbiddenException when contest has not started`() {
            val futureContest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
            val futureMember = MockEntityFactory.member(contest = futureContest)
            val futureAttachment =
                MockEntityFactory.attachment(
                    context = Attachment.Context.SUBMISSION_CODE,
                    member = futureMember,
                )
            assertThrows<ForbiddenException> {
                config.authorizeContestantDownload(futureContest, futureMember, futureAttachment)
            }
        }

        @Test
        fun `should throw ForbiddenException when attachment does not belong to member`() {
            val otherMember = MockEntityFactory.member(contest = contest)
            assertThrows<ForbiddenException> {
                config.authorizeContestantDownload(contest, otherMember, attachment)
            }
        }

        @Test
        fun `should not throw ForbiddenException when contest has started and attachment belongs to member`() {
            assertDoesNotThrow {
                config.authorizeContestantDownload(contest, member, attachment)
            }
        }
    }

    @Nested
    inner class AuthorizeSpectatorDownload {
        @Test
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
                config.authorizeSpectatorDownload(contest, attachment)
            }
        }
    }
}
