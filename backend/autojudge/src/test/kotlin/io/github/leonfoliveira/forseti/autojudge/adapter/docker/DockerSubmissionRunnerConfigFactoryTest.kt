package io.github.leonfoliveira.forseti.autojudge.adapter.docker

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
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
            val languages = Submission.Language.entries.toTypedArray()

            languages.forEach {
                sut.get(it) shouldNotBe null
            }
        }
    })

@Configuration
@ComponentScan("io.github.leonfoliveira.forseti.autojudge.adapter.docker.config")
class Configs
