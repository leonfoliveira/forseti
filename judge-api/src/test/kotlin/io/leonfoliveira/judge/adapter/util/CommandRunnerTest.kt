package io.leonfoliveira.judge.adapter.util

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class CommandRunnerTest : FunSpec({
    test("should execute command") {
        val command = arrayOf("echo", "hello")
        val result = CommandRunner.run(command)
        result.trim() shouldBe "hello"
    }

    test("should throw exception on non-zero exit code") {
        val command = arrayOf("false")
        shouldThrow<RuntimeException> {
            CommandRunner.run(command)
        }
    }
})
