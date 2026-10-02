package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.port.output.cache.SessionCache
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class SessionDeleterTest {
    @Test
    fun `evicts cache entries by member id`() {
        val cache = mock<SessionCache>()
        val member = MockEntityFactory.member()

        SessionDeleter(cache).deleteByMember(member)

        verify(cache).evictByMemberId(memberId = member.id)
    }
}
