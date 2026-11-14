package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow

class ContestAuthorizerTest {
    @Nested
    inner class RequireContestNotStarted {
        @Test
        fun `requireContestNotStarted should throw ForbiddenException if contest has started`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest).requireContestNotStarted().throwIfErrors()
            }
        }

        @Test
        fun `requireContestNotStarted should not throw ForbiddenException if contest has not started`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().plusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(2),
                )

            assertDoesNotThrow {
                ContestAuthorizer(contest).requireContestNotStarted().throwIfErrors()
            }
        }
    }

    @Nested
    inner class RequireContestStarted {
        @Test
        fun `requireContestStarted should throw ForbiddenException if contest has not started`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().plusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(2),
                )

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest).requireContestStarted().throwIfErrors()
            }
        }

        @Test
        fun `requireContestStarted should not throw ForbiddenException if contest has started`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )

            assertDoesNotThrow {
                ContestAuthorizer(contest).requireContestStarted().throwIfErrors()
            }
        }
    }

    @Nested
    inner class RequireContestNotEnded {
        @Test
        fun `requireContestNotEnded should throw ForbiddenException if contest has ended`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(2),
                    endAt = OffsetDateTime.now().minusMinutes(1),
                )

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest).requireContestNotEnded().throwIfErrors()
            }
        }

        @Test
        fun `requireContestNotEnded should not throw ForbiddenException if contest has not ended`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )

            assertDoesNotThrow {
                ContestAuthorizer(contest).requireContestNotEnded().throwIfErrors()
            }
        }
    }

    @Nested
    inner class RequireContestActive {
        @Test
        fun `requireContestActive should throw ForbiddenException if contest is not active`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(2),
                    endAt = OffsetDateTime.now().minusMinutes(1),
                )

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest).requireContestActive().throwIfErrors()
            }
        }

        @Test
        fun `requireContestActive should not throw ForbiddenException if contest is active`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )

            assertDoesNotThrow {
                ContestAuthorizer(contest).requireContestActive().throwIfErrors()
            }
        }
    }

    @Nested
    inner class RequireMemberToBelong {
        @Test
        fun `requireMemberToBelong should throw ForbiddenException if member does not belong to contest`() {
            val contest1 =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )
            val contest2 =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )
            val member = MockEntityFactory.member(contest = contest2)

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest1, member).requireMemberToBelong().throwIfErrors()
            }
        }

        @Test
        fun `requireMemberToBelong should not throw ForbiddenException if member belongs to contest`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )
            val member = MockEntityFactory.member(contest = contest)

            assertDoesNotThrow {
                ContestAuthorizer(contest, member).requireMemberToBelong().throwIfErrors()
            }
        }
    }

    @Nested
    inner class RequireMemberType {
        @Test
        fun `requireMemberType should throw ForbiddenException if member type is not allowed`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )
            val member = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest, member)
                    .requireMemberType(Member.Type.ADMIN, Member.Type.JUDGE)
                    .throwIfErrors()
            }
        }

        @Test
        fun `requireMemberType should not throw ForbiddenException if member type is allowed`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().minusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(1),
                )
            val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)

            assertDoesNotThrow {
                ContestAuthorizer(contest, member)
                    .requireMemberType(Member.Type.ADMIN, Member.Type.JUDGE)
                    .throwIfErrors()
            }
        }
    }

    @Nested
    inner class RequireMemberCanAccessNotStartedContest {
        @Test
        fun `requireMemberCanAccessNotStartedContest should throw ForbiddenException if member type is not allowed`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().plusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(2),
                )
            val member = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)

            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest, member).requireMemberCanAccessNotStartedContest().throwIfErrors()
            }
        }

        @Test
        fun `requireMemberCanAccessNotStartedContest should not throw ForbiddenException if member type is allowed`() {
            val contest =
                MockEntityFactory.contest(
                    startAt = OffsetDateTime.now().plusMinutes(1),
                    endAt = OffsetDateTime.now().plusMinutes(2),
                )
            val member = MockEntityFactory.member(contest = contest, type = Member.Type.ADMIN)

            assertDoesNotThrow {
                ContestAuthorizer(contest, member).requireMemberCanAccessNotStartedContest().throwIfErrors()
            }
        }
    }

    @Test
    fun `should chain authorization checks using or`() {
        val contest =
            MockEntityFactory.contest(
                startAt = OffsetDateTime.now().plusMinutes(1),
                endAt = OffsetDateTime.now().plusMinutes(2),
            )
        val member = MockEntityFactory.member(contest = contest, type = Member.Type.CONTESTANT)

        assertThrows(ForbiddenException::class.java) {
            ContestAuthorizer(contest, member)
                .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
                .throwIfErrors()
        }
    }
}
