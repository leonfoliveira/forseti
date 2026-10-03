package com.forsetijudge.core.application.service.authentication

import com.forsetijudge.core.application.helper.session.SessionCreator
import com.forsetijudge.core.application.helper.session.SessionDeleter
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.authentication.SignInUseCase
import com.forsetijudge.core.port.output.cryptography.Hasher
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.vault.Vault
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class SignInServiceTest {
    private val contests = mock<ContestRepository>()
    private val members = mock<MemberRepository>()
    private val sessionCreator = mock<SessionCreator>()
    private val sessionDeleter = mock<SessionDeleter>()
    private val vault = mock<Vault>()
    private val hasher = mock<Hasher>()
    private val service = SignInService(contests, members, sessionCreator, sessionDeleter, vault, hasher)

    @Test
    fun `authenticates member password and creates session`() {
        val contest = MockEntityFactory.contest()
        val member = MockEntityFactory.member(contest = contest)
        val session = MockModelFactory.session()
        val command = SignInUseCase.Command(contest.id, member.login, "password")
        whenever(contests.findById(contest.id)).thenReturn(contest)
        whenever(members.findByLoginAndContestIdOrContestIsNull(member.login, contest.id)).thenReturn(member)
        whenever(hasher.verify("password", member.password)).thenReturn(true)
        whenever(sessionCreator.create(contest.id, member)).thenReturn(session)

        assertSame(session, service.execute(command))

        verify(sessionDeleter).deleteByMember(member)
        verify(hasher).verify("password", member.password)
    }

    @Test
    fun `authenticates root using vault secret and contestless lookup`() {
        val root = MockEntityFactory.member(type = Member.Type.ROOT)
        val session = MockModelFactory.session(contestId = null)
        whenever(members.findByLoginAndContestIsNull(root.login)).thenReturn(root)
        whenever(vault.getSecret(SignInService.ROOT_PASSWORD_SECRET_KEY)).thenReturn("root-secret")
        whenever(sessionCreator.create(null, root)).thenReturn(session)

        assertSame(session, service.execute(SignInUseCase.Command(null, root.login, "root-secret")))

        verify(hasher, never()).verify(any(), any())
    }

    @Test
    fun `rejects invalid credentials and unknown contest`() {
        val member = MockEntityFactory.member()
        whenever(members.findByLoginAndContestIsNull(member.login)).thenReturn(member)
        whenever(hasher.verify(any(), eq(member.password))).thenReturn(false)
        assertThrows(UnauthorizedException::class.java) {
            service.execute(SignInUseCase.Command(null, member.login, "bad-password"))
        }
        verify(sessionCreator, never()).create(any(), any())

        val contestId = UUID.randomUUID()
        whenever(contests.findById(contestId)).thenReturn(null)
        assertThrows(NotFoundException::class.java) {
            service.execute(SignInUseCase.Command(contestId, member.login, "password"))
        }
    }
}
