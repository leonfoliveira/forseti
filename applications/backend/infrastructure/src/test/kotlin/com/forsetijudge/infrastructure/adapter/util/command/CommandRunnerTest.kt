package com.forsetijudge.infrastructure.adapter.util.command

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class CommandRunnerTest :
    FunSpec({
        test("should run a command and return its output") {
            val command = arrayOf("echo", "Hello, World!")
            val output = CommandRunner.run(command)
            output.trim() shouldBe "Hello, World!"
        }

        test("should run a command with input and return its output") {
            val command = arrayOf("cat")
            val stdin = "Hello, World!"
            val output = CommandRunner.run(command, stdin)
            output.trim() shouldBe stdin
        }

        test("should throw CommandError on non-zero exit code") {
            val command = arrayOf("false")
            val exception =
                shouldThrow<CommandError> {
                    CommandRunner.run(command)
                }
            exception.message shouldBe ""
            exception.exitCode shouldBe 1
        }
    })
