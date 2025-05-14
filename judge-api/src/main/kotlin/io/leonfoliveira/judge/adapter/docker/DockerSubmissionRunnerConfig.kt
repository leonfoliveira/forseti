package io.leonfoliveira.judge.adapter.docker

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.io.File

class DockerSubmissionRunnerConfig(
    val image: String,
    val compileCommand: Array<String>?,
    val runCommand: Array<String>,
) {
    class Builder(
        val image: String,
        val createCompileCommand: ((File) -> Array<String>)?,
        val createRunCommand: (File) -> Array<String>,
    ) {
        companion object {
            private val LANGUAGE_BUILDER_MAP =
                mapOf(
                    Language.PYTHON_3_13_3 to
                        Builder(
                            image = "python:3.13.3",
                            createCompileCommand = null,
                            createRunCommand = { codeFile ->
                                arrayOf("python", "/app/${codeFile.name}")
                            },
                        ),
                )

            fun get(language: Language): Builder {
                return LANGUAGE_BUILDER_MAP[language]
                    ?: throw IllegalArgumentException("Unsupported language: $language")
            }
        }

        fun build(code: File): DockerSubmissionRunnerConfig {
            return DockerSubmissionRunnerConfig(
                image = image,
                compileCommand = createCompileCommand?.invoke(code),
                runCommand = createRunCommand(code),
            )
        }
    }
}
