package com.forsetijudge.infrastructure.adapter.driven.redis

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.cache.LeaderboardCacheStore
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.UUID
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.toJavaDuration

@Component
class LeaderboardRedisStore(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
) : LeaderboardCacheStore {
    private val logger = SafeLogger(this::class)

    companion object {
        const val CELL_STORE_KEY = "leaderboard:cell"
        const val CELL_TTL_MILLIS = 6 * 60 * 60 * 1000L
    }

    override fun cacheCell(
        contestId: UUID,
        cell: Leaderboard.Cell,
    ) {
        val cellKey = "${CELL_STORE_KEY}:$contestId:${cell.memberId}:${cell.problemId}"
        val contestKey = "${CELL_STORE_KEY}:$contestId"
        logger.info("Caching leaderboard cell with cellKey = $cellKey and contestKey = $contestKey")

        val rawCell = objectMapper.writeValueAsString(cell)
        redisTemplate.opsForValue().set(cellKey, rawCell)
        redisTemplate.opsForSet().add(contestKey, cellKey)
        clean(contestKey)
        clean(cellKey)

        logger.info("Leaderboard cell cached successfully")
    }

    override fun getAllCellsByContestId(contestId: UUID): List<Leaderboard.Cell> {
        val contestKey = "${CELL_STORE_KEY}:$contestId"
        logger.info("Retrieving all leaderboard cells for contestKey: $contestKey")

        val cellKeys = redisTemplate.opsForSet().members(contestKey)
        if (cellKeys.isNullOrEmpty()) {
            logger.info("No cell keys found for contestKey: $contestKey")
            return emptyList()
        }
        val rawCells = redisTemplate.opsForValue().multiGet(cellKeys)?.filter { it.isNullOrEmpty() }
        if (rawCells.isNullOrEmpty()) {
            logger.info("No leaderboard cells found for contestKey: $contestKey")
            return emptyList()
        }

        val cells =
            rawCells.map { rawCell ->
                objectMapper.readValue(rawCell, Leaderboard.Cell::class.java)
            }

        logger.info("Retrieved ${cells.size} leaderboard cells")
        return cells
    }

    /**
     * Set the expiration time for the given contest key and its associated cell keys to prevent stale data from accumulating in Redis.
     * Clean up by size is not necessary because the number of cells is expected to be small and the expiration time will ensure that old data is removed automatically.
     *
     * @param contestKey The key of the contest for which to set the expiration time.
     */
    private fun clean(contestKey: String) {
        redisTemplate.expire(contestKey, CELL_TTL_MILLIS.milliseconds.toJavaDuration())
    }
}
