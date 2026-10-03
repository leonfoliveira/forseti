package com.forsetijudge.core.infrastructure.redis

import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.testcontainer.TestContainerRedis
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class LeaderboardRedisCacheStoreIntegrationTest : TestContainerRedis() {
    private val store = LeaderboardRedisCacheStore(redisTemplate, objectMapper)

    @Test
    fun `caches cells and retrieves all by contest`() {
        val contestId = UUID.randomUUID()
        val cellA = MockModelFactory.leaderboardCell(isAccepted = true, penalty = 10)
        val cellB = MockModelFactory.leaderboardCell(problemLetter = 'B', wrongSubmissions = 2)
        val otherContestCell = MockModelFactory.leaderboardCell()

        store.cacheCell(contestId, cellA)
        store.cacheCell(contestId, cellB)
        store.cacheCell(UUID.randomUUID(), otherContestCell)

        val cells = store.getAllCellsByContestId(contestId)

        assertEquals(setOf(cellA, cellB), cells.toSet())
        assertTrue(redisTemplate.getExpire("leaderboard_cell:$contestId") > 0)
    }

    @Test
    fun `returns empty list for contest without cells`() {
        assertEquals(emptyList<Any>(), store.getAllCellsByContestId(UUID.randomUUID()))
    }
}
