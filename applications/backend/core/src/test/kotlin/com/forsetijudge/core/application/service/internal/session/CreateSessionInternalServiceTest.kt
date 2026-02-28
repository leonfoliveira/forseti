package com.forsetijudge.core.application.service.internal.session

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.SessionRepository
import com.forsetijudge.core.port.driving.usecase.internal.session.CreateSessionInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.session.DeleteAllSessionsByMemberInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import java.time.OffsetDateTime

class CreateSessionInternalServiceTest :
    FunSpec({
        val sessionRepository = mockk<SessionRepository>(relaxed = true)
        val deleteAllSessionsByMemberInternalUseCase = mockk<DeleteAllSessionsByMemberInternalUseCase>(relaxed = true)
        val defaultExpiration = "1h"
        val rootExpiration = "1h"
        val systemExpiration = "1h"

        val sut =
            CreateSessionInternalService(
                sessionRepository = sessionRepository,
                deleteAllSessionsByMemberInternalUseCase = deleteAllSessionsByMemberInternalUseCase,
                defaultExpiration = defaultExpiration,
                rootExpiration = rootExpiration,
                systemExpiration = systemExpiration,
            )

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
            ExecutionContextMockBuilder.build()
        }

        listOf(
            Member.Type.ADMIN,
            Member.Type.STAFF,
            Member.Type.JUDGE,
            Member.Type.CONTESTANT,
            Member.Type.UNOFFICIAL_CONTESTANT,
        ).forEach { memberType ->
            test("should create session successfully for $memberType member") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType)
                val command = CreateSessionInternalUseCase.Command(member)
                every { sessionRepository.save(any()) } answers { firstArg() }

                val result = sut.execute(command)

                result.member shouldBe member
                result.expiresAt shouldBe ExecutionContext.get().startedAt.plusHours(1)
                verify { sessionRepository.save(result) }
                verify {
                    deleteAllSessionsByMemberInternalUseCase.execute(
                        DeleteAllSessionsByMemberInternalUseCase.Command(
                            member,
                        ),
                    )
                }
            }
        }

        test("should create session successfully for root member") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.ROOT)
            val command = CreateSessionInternalUseCase.Command(member)
            every { sessionRepository.save(any()) } answers { firstArg() }

            val result = sut.execute(command)

            result.member shouldBe member
            result.expiresAt shouldBe ExecutionContext.get().startedAt.plusHours(1)
            verify { sessionRepository.save(result) }
            verify { deleteAllSessionsByMemberInternalUseCase.execute(DeleteAllSessionsByMemberInternalUseCase.Command(member)) }
        }

        listOf(Member.Type.API, Member.Type.AUTOJUDGE).forEach { memberType ->
            test("should create session successfully for $memberType member") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = memberType)
                val command = CreateSessionInternalUseCase.Command(member)
                every { sessionRepository.save(any()) } answers { firstArg() }

                val result = sut.execute(command)

                result.member shouldBe member
                result.expiresAt shouldBe ExecutionContext.get().startedAt.plusHours(1)
                verify { sessionRepository.save(result) }
                verify {
                    deleteAllSessionsByMemberInternalUseCase.execute(
                        DeleteAllSessionsByMemberInternalUseCase.Command(
                            member,
                        ),
                    )
                }
            }
        }
    })
