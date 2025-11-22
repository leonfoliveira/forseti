package live.forseti.infrastructure.adapter.driven.docker.config

import live.forseti.core.domain.entity.Submission
import live.forseti.infrastructure.adapter.driven.docker.DockerSubmissionRunnerConfig
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JavaSubmissionRunnerConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    @Bean
    fun java21() =
        DockerSubmissionRunnerConfig(
            language = Submission.Language.JAVA_21,
            image = "forseti-sb-java21:$version",
            createCompileCommand = { codeFile ->
                arrayOf("javac", "-d", ".", codeFile.name)
            },
            createRunCommand = { codeFile, memoryLimit ->
                arrayOf("java", "-Xmx${memoryLimit}m", "-cp", ".", codeFile.nameWithoutExtension)
            },
        )
}
