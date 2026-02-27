package com.forsetijudge.infrastructure.adapter.driven.redis

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.testcontainer.RedisTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [LeaderboardRedisStore::class, JacksonConfig::class])
@Import(RedisTestContainer::class)
class LeaderboardRedisStoreTest(
    private val sut: LeaderboardRedisStore,
) : FunSpec({
        test("should store and retrieve leaderboard cells correctly") {
            val contest1Id = IdGenerator.getUUID()
            val contest2Id = IdGenerator.getUUID()
            val cell1 = LeaderboardMockBuilder.buildCell()
            val cell2 = LeaderboardMockBuilder.buildCell()

            sut.cacheCell(contest1Id, cell1)
            sut.cacheCell(contest2Id, cell2)

            val retrievedContestCells = sut.getAllCellsByContestId(contest1Id)

            retrievedContestCells shouldHaveSize 1
            retrievedContestCells shouldContainExactlyInAnyOrder listOf(cell1)
        }
    })
