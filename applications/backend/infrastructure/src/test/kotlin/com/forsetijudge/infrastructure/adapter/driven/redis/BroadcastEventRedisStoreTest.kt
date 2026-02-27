package com.forsetijudge.infrastructure.adapter.driven.redis

import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.testcontainer.RedisTestContainer
import com.forsetijudge.infrastructure.config.RedisConfig
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.delay
import kotlinx.coroutines.test.runTest
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import java.io.Serializable
import java.time.OffsetDateTime

@ActiveProfiles("test")
@SpringBootTest(classes = [BroadcastEventRedisStore::class, RedisConfig::class, JacksonConfig::class])
@Import(RedisTestContainer::class)
class BroadcastEventRedisStoreTest(
    private val sut: BroadcastEventRedisStore,
) : FunSpec({
        test("should add and retrieve broadcast events correctly") {
            runTest {
                val event1 =
                    BroadcastEvent(room = "/room1", name = "event1", data = mapOf("foo" to "bar") as Serializable)

                sut.add(event1)
                delay(1000)
                val now = OffsetDateTime.now()
                val event2 =
                    BroadcastEvent(room = "/room1", name = "event2", data = mapOf("foo" to "bar") as Serializable)
                val event3 =
                    BroadcastEvent(room = "/room2", name = "event3", data = mapOf("foo" to "bar") as Serializable)
                sut.add(event2)
                sut.add(event3)

                val retrievedEvents = sut.getAllSince("/room1", now)

                retrievedEvents shouldHaveSize 1
                retrievedEvents.first().name shouldBe "event2"
            }
        }

        test("should maintain a maximum of 100 events per room") {
            val room = "/room1"
            for (i in 1..105) {
                sut.add(BroadcastEvent(room = room, name = "event$i", data = mapOf("foo" to "bar") as Serializable))
            }

            val retrievedEvents = sut.getAllSince(room, OffsetDateTime.now().minusDays(1))

            retrievedEvents.size shouldBe 100
            retrievedEvents.first().name shouldBe "event6"
            retrievedEvents.last().name shouldBe "event105"
        }
    })
