package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.time.OffsetDateTime
import java.util.UUID

class ContestAuthFilterTest : FunSpec({
    val findContestService = mockk<FindContestService>(relaxed = true)

    val sut =
        ContestAuthFilter(
            findContestService = findContestService,
        )

    val authorizationMember =
        AuthorizationMember(
            id = UUID.randomUUID(),
            contestId = UUID.randomUUID(),
            type = Member.Type.CONTESTANT,
            name = "Test User",
        )

    beforeEach {
        clearAllMocks()
        mockkObject(AuthorizationContextUtil)
    }

    context("checkIfMemberBelongsToContest") {
        test("should throw ForbiddenException when contestId does not match") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = UUID.randomUUID())

            shouldThrow<ForbiddenException> {
                sut.checkIfMemberBelongsToContest(contestId)
            }
        }

        test("should not throw ForbiddenException when contestId matches") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = contestId)

            sut.checkIfMemberBelongsToContest(contestId)
        }

        test("should not throw ForbiddenException when member is ROOT") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns
                authorizationMember.copy(contestId = UUID.randomUUID(), type = Member.Type.ROOT)

            sut.checkIfMemberBelongsToContest(contestId)
        }
    }

    context("checkIfStarted") {
        test("should throw ForbiddenException when contest has not started and member is CONTESTANT") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = UUID.randomUUID())
            every {
                findContestService.findById(contestId)
            } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))

            shouldThrow<ForbiddenException> {
                sut.checkIfStarted(contestId)
            }
        }

        test("should not throw ForbiddenException when contest has started and member is CONTESTANT") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = UUID.randomUUID())
            every {
                findContestService.findById(contestId)
            } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1))

            sut.checkIfStarted(contestId)
        }

        test("should not throw ForbiddenException when member is ADMIN") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns
                authorizationMember.copy(contestId = UUID.randomUUID(), type = Member.Type.ADMIN)
            every {
                findContestService.findById(contestId)
            } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))

            sut.checkIfStarted(contestId)
        }

        test("should not throw ForbiddenException when member is ROOT") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns
                authorizationMember.copy(contestId = UUID.randomUUID(), type = Member.Type.ROOT)
            every {
                findContestService.findById(contestId)
            } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))

            sut.checkIfStarted(contestId)
        }
    }
})
