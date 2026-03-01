package com.forsetijudge.infrastructure.adapter.driven.redis

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.core.testcontainer.RedisTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [SessionRedisStore::class, JacksonConfig::class])
@Import(RedisTestContainer::class)
class SessionRedisStoreTest(
    private val sut: SessionRedisStore,
) : FunSpec({
        beforeTest {
            clearAllMocks()
        }

        test("should cache session successfully") {
            val session = SessionMockBuilder.build().toResponseBodyDTO()

            sut.cache(session)

            sut.get(session.id) shouldNotBe null
            sut.get(IdGenerator.getUUID()) shouldBe null

            sut.evictAll(listOf(session.id))

            sut.get(session.id) shouldBe null
        }
    })
