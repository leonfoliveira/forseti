package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.cache.SessionCache
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class SessionDeleterTest {
    val sessionCache = mock<SessionCache>()
    val sessionDeleter = SessionDeleter(sessionCache)

    @Test
    fun `evicts cache entries by member id`() {
        val member = MockEntityFactory.member()

        sessionDeleter.deleteByMember(member)

        verify(sessionCache).evictByMemberId(memberId = member.id)
    }
}
