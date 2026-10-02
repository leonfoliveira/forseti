package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.InternalServerException
import com.forsetijudge.core.test.factory.MockEntityFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test

class ContestAuthorizerTest {
    @Test
    fun `checks contest lifecycle requirements`() {
        val activeContest = MockEntityFactory.contest()
        val authorizer = ContestAuthorizer(activeContest)
        assertSame(authorizer, authorizer.requireContestActive())
        assertThrows(ForbiddenException::class.java) {
            ContestAuthorizer(
                MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1)),
            ).requireContestStarted().throwIfErrors()
        }
        assertThrows(ForbiddenException::class.java) {
            ContestAuthorizer(
                MockEntityFactory.contest(endAt = OffsetDateTime.now().minusSeconds(1)),
            ).requireContestNotEnded().throwIfErrors()
        }
        ContestAuthorizer(
            MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1)),
        ).requireContestNotStarted().throwIfErrors()
    }

    @Test
    fun `accumulates errors in invocation order`() {
        val error =
            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(
                    MockEntityFactory.contest(
                        startAt = OffsetDateTime.now().plusHours(1),
                        endAt = OffsetDateTime.now().minusSeconds(1),
                    ),
                ).requireContestStarted().requireContestNotEnded().throwIfErrors()
            }

        assertEquals("Contest has not started yet\nContest has ended", error.message)
    }

    @Test
    fun `checks member presence ownership and allowed types`() {
        val contest = MockEntityFactory.contest()
        val matchingMember = MockEntityFactory.member(contest = contest)
        ContestAuthorizer(contest, matchingMember)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .throwIfErrors()

        val mismatchedMember = MockEntityFactory.member(contest = MockEntityFactory.contest())
        assertThrows(ForbiddenException::class.java) {
            ContestAuthorizer(contest, mismatchedMember).requireMemberToBelong().throwIfErrors()
        }
        assertThrows(InternalServerException::class.java) {
            ContestAuthorizer(contest).requireMemberToBelong()
        }
        assertThrows(ForbiddenException::class.java) {
            ContestAuthorizer(contest, matchingMember)
                .requireMemberType(Member.Type.ADMIN)
                .throwIfErrors()
        }
    }

    @Test
    fun `allows staff before contest starts and supports alternative authorizers`() {
        val contest = MockEntityFactory.contest(startAt = OffsetDateTime.now().plusHours(1))
        val staff = MockEntityFactory.member(contest = contest, type = Member.Type.JUDGE)
        ContestAuthorizer(contest, staff).requireMemberCanAccessNotStartedContest().throwIfErrors()

        val contestant = MockEntityFactory.member(contest = contest)
        assertThrows(ForbiddenException::class.java) {
            ContestAuthorizer(contest, contestant).requireMemberCanAccessNotStartedContest().throwIfErrors()
        }
        assertThrows(InternalServerException::class.java) {
            ContestAuthorizer(contest).requireMemberCanAccessNotStartedContest()
        }

        ContestAuthorizer(contest, contestant)
            .or(
                { it.requireContestStarted() },
                { it.requireMemberType(Member.Type.CONTESTANT) },
            ).throwIfErrors()
        val failures =
            assertThrows(ForbiddenException::class.java) {
                ContestAuthorizer(contest, contestant)
                    .or({ it.requireContestStarted() }, { it.requireMemberType(Member.Type.ADMIN) })
                    .throwIfErrors()
            }
        assertEquals(
            "Contest has not started yet\nMember type CONTESTANT is not allowed to perform this action",
            failures.message,
        )
    }
}
