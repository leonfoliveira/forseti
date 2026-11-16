package com.forsetijudge.core.application.helper.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows

class ProblemDescriptionAuthorizationConfigTest {
    val config = ProblemDescriptionAuthorizationConfig()

    val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().minusDays(1))
    val member = MockEntityFactory.member(contest = contest)
    val attachment = MockEntityFactory.attachment(context = Attachment.Context.EXECUTION_DETAILS)

    @Nested
    inner class AuthorizeAdminUpload {
        @Test
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val otherMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
            assertThrows<ForbiddenException> {
                config.authorizeAdminUpload(contest, otherMember)
            }
        }

        @Test
        fun `should not throw ForbiddenException when member belongs to contest`() {
            assertDoesNotThrow {
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
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
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
        fun `should throw ForbiddenException when member does not belongs to contest`() {
            val otherMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
            assertThrows<ForbiddenException> {
                config.authorizeContestantDownload(contest, otherMember, attachment)
            }
        }

        @Test
        fun `should throw ForbiddenException when contest has not started`() {
            val otherContest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
            val otherMember = MockEntityFactory.member(contest = otherContest)
            assertThrows<ForbiddenException> {
                config.authorizeContestantDownload(otherContest, otherMember, attachment)
            }
        }

        @Test
        fun `should not throw ForbiddenException when member belongs to contest and contest has started`() {
            assertDoesNotThrow {
                config.authorizeContestantDownload(contest, member, attachment)
            }
        }
    }

    @Nested
    inner class AuthorizeSpectatorDownload {
        @Test
        fun `should throw ForbiddenException when contest has not started`() {
            val otherContest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusDays(1))
            assertThrows<ForbiddenException> {
                config.authorizeSpectatorDownload(otherContest, attachment)
            }
        }

        @Test
        fun `should throw ForbiddenException when spectator is not enabled`() {
            val otherContest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusDays(1),
                    settings = Contest.Settings(isSpectatorEnabled = false),
                )
            assertThrows<ForbiddenException> {
                config.authorizeSpectatorDownload(otherContest, attachment)
            }
        }

        @Test
        fun `should not throw ForbiddenException when contest has started and spectator is enabled`() {
            val otherContest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusDays(1),
                    settings = Contest.Settings(isSpectatorEnabled = true),
                )
            assertDoesNotThrow {
                config.authorizeSpectatorDownload(otherContest, attachment)
            }
        }
    }
}
