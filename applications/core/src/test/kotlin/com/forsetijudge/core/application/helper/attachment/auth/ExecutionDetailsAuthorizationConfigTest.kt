package com.forsetijudge.core.application.helper.attachment.auth

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows

class ExecutionDetailsAuthorizationConfigTest {
    val config = ExecutionDetailsAuthorizationConfig()

    val contest = MockEntityFactory.contest()
    val member = MockEntityFactory.member(contest = contest)
    val attachment = MockEntityFactory.attachment(context = Attachment.Context.EXECUTION_DETAILS)

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
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
                config.authorizeStaffDownload(contest, member, attachment)
            }
        }
    }

    @Nested
    inner class AuthorizeContestantDownload {
        @Test
        fun `should throw ForbiddenException`() {
            assertThrows<ForbiddenException> {
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
