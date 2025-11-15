package io.github.leonfoliveira.forseti.api.adapter.util

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.port.driving.FindContestUseCase
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime
import java.util.UUID

class ContestAuthFilterTest :
    FunSpec({
        val findContestUseCase = mockk<FindContestUseCase>(relaxed = true)

        val sut =
            ContestAuthFilter(
                findContestUseCase = findContestUseCase,
            )

        beforeEach {
            clearAllMocks()
            RequestContext.Companion.clearContext()
        }

        context("checkIfMemberBelongsToContest") {
            test("should throw ForbiddenException when contestId does not match") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session = SessionMockBuilder.build()

                shouldThrow<ForbiddenException> {
                    sut.checkIfMemberBelongsToContest(contestId)
                }
            }

            test("should not throw ForbiddenException when contestId matches") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(contest = ContestMockBuilder.build(id = contestId)),
                    )

                sut.checkIfMemberBelongsToContest(contestId)
            }

            test("should not throw ForbiddenException when member is ROOT") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                    )

                sut.checkIfMemberBelongsToContest(contestId)
            }
        }

        context("checkIfStarted") {
            test("should throw ForbiddenException when contest has not started and member is CONTESTANT") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session = SessionMockBuilder.build()
                every {
                    findContestUseCase.findById(contestId)
                } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))

                shouldThrow<ForbiddenException> {
                    sut.checkIfStarted(contestId)
                }
            }

            test("should not throw ForbiddenException when contest has started and member is CONTESTANT") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session = SessionMockBuilder.build()
                every {
                    findContestUseCase.findById(contestId)
                } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1))

                sut.checkIfStarted(contestId)
            }

            test("should not throw ForbiddenException when member is ADMIN") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                    )
                every {
                    findContestUseCase.findById(contestId)
                } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))

                sut.checkIfStarted(contestId)
            }

            test("should not throw ForbiddenException when member is ROOT") {
                val contestId = UUID.randomUUID()
                RequestContext.Companion.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                    )
                every {
                    findContestUseCase.findById(contestId)
                } returns ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))

                sut.checkIfStarted(contestId)
            }
        }
    })
