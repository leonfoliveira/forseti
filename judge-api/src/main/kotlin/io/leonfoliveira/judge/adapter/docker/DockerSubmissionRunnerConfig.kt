package io.leonfoliveira.judge.adapter.docker

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.io.File

class DockerSubmissionRunnerConfig(
    val image: String,
    val compileCommand: Array<String>?,
    val runCommand: Array<String>,
) {
    data class RawConfig(
        val image: String,
        val createCompileCommand: ((File) -> Array<String>)?,
        val createRunCommand: (File) -> Array<String>,
    )

    companion object {
        private val CONFIG =
            mapOf(
                Language.PYTHON_3_13_3 to
                    RawConfig(
                        image = "python:3.13.3",
                        createCompileCommand = null,
                        createRunCommand = { codeFile ->
                            arrayOf("python", "/app/${codeFile.name}")
                        },
                    ),
            )

        fun get(
            language: Language,
            code: File,
        ): DockerSubmissionRunnerConfig {
            val rawConfig =
                CONFIG[language]
                    ?: throw IllegalArgumentException("Unsupported language: $language")
            return DockerSubmissionRunnerConfig(
                image = rawConfig.image,
                compileCommand = rawConfig.createCompileCommand?.invoke(code),
                runCommand = rawConfig.createRunCommand(code),
            )
        }
    }
}
