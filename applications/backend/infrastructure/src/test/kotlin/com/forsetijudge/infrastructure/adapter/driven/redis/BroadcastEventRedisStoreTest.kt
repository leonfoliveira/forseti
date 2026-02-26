package com.forsetijudge.infrastructure.adapter.driven.redis

import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.testcontainer.RedisTestContainer
import com.forsetijudge.infrastructure.config.RedisConfig
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.delay
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
        test("should save and retrieve broadcast events correctly") {
            val event1 = BroadcastEvent(room = "/room1", name = "event", data = mapOf("foo" to "bar") as Serializable)
            val event2 = BroadcastEvent(room = "/room1", name = "event", data = mapOf("foo" to "bar") as Serializable)
            val event3 = BroadcastEvent(room = "/room2", name = "event", data = mapOf("foo" to "bar") as Serializable)

            sut.save(event1)
            delay(1000)
            val now = OffsetDateTime.now()
            sut.save(event2)
            sut.save(event3)

            val retrievedEvents = sut.getAllSince("/room1", now)

            retrievedEvents shouldContainExactly listOf(event2)
        }

        test("should maintain a maximum of 100 events per room") {
            val room = "/room1"
            for (i in 1..105) {
                sut.save(BroadcastEvent(room = room, name = "event$i", data = mapOf("foo" to "bar") as Serializable))
            }

            val retrievedEvents = sut.getAllSince(room, OffsetDateTime.now().minusDays(1))

            retrievedEvents.size shouldBe 100
            retrievedEvents.first().name shouldBe "event6"
            retrievedEvents.last().name shouldBe "event105"
        }
    })
