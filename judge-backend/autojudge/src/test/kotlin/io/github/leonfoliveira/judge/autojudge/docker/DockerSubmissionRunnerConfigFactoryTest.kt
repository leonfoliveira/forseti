package io.github.leonfoliveira.judge.autojudge.docker

import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldNotBe
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration

@SpringBootTest(classes = [DockerSubmissionRunnerConfigFactory::class, Configs::class])
class DockerSubmissionRunnerConfigFactoryTest(
    val sut: DockerSubmissionRunnerConfigFactory,
) : FunSpec({
        test("should have configs for all languages") {
            val languages = Language.entries.toTypedArray()

            languages.forEach {
                sut.get(it) shouldNotBe null
            }
        }
    })

@Configuration
@ComponentScan("io.github.leonfoliveira.judge.autojudge.docker.config")
class Configs
