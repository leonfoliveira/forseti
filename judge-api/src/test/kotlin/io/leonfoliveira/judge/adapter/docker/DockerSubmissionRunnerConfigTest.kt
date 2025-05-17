package io.leonfoliveira.judge.adapter.docker

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.exception.BusinessException
import io.mockk.every
import io.mockk.mockk
import java.io.File

class DockerSubmissionRunnerConfigTest : FunSpec({
    val fileName = "code.py"
    val file = mockk<File>()
    every { file.name } returns fileName

    class TestCase(
        val language: Language,
        val image: String,
        val compileCommand: Array<String>?,
        val runCommand: Array<String>,
    )

    listOf(
        TestCase(Language.PYTHON_3_13_3, "python:3.13.3", null, arrayOf("python", "/app/$fileName")),
    ).forEach {
        test("should create config") {
            val builder = DockerSubmissionRunnerConfig.Builder.get(it.language)
            val config = builder.build(file)

            config.image shouldBe it.image
            config.compileCommand shouldBe it.compileCommand
            config.runCommand shouldBe it.runCommand
        }
    }

    test("should throw exception when language is not supported") {
        val unsupportedLanguage = mockk<Language>()

        shouldThrow<BusinessException> {
            DockerSubmissionRunnerConfig.Builder.get(unsupportedLanguage)
        }
    }
})
