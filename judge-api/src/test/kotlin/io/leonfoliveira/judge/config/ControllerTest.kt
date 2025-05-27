package io.leonfoliveira.judge.config

import com.ninjasquad.springmockk.MockkBean
import io.leonfoliveira.judge.core.port.JwtAdapter
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.core.annotation.AliasFor
import org.springframework.test.context.ActiveProfiles
import kotlin.reflect.KClass

@ActiveProfiles("test")
@WebMvcTest(excludeAutoConfiguration = [SecurityAutoConfiguration::class])
@Import(JwtTestConfig::class)
@AutoConfigureMockMvc
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
annotation class ControllerTest(
    @get:AliasFor(annotation = WebMvcTest::class, attribute = "controllers")
    val controllers: Array<KClass<*>> = [],
)

@Configuration
class JwtTestConfig(
    @MockkBean val jwtAdapter: JwtAdapter,
)
