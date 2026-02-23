package com.forsetijudge.infrastructure.adapter.util.command

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.springframework.test.context.ActiveProfiles

class CommandRunnerTest :
    FunSpec({
        test("should run a command and return its output") {
            val command = arrayOf("echo", "Hello, World!")
            val output = CommandRunner.run(command)
            output.trim() shouldBe "Hello, World!"
        }

        test("should run a command with input and return its output") {
            val command = arrayOf("cat")
            val input = "Hello, World!"
            val output = CommandRunner.run(command, input)
            output.trim() shouldBe input
        }

        test("should throw CommandError on non-zero exit code") {
            val command = arrayOf("false")
            val exception =
                shouldThrow<CommandError> {
                    CommandRunner.run(command)
                }
            exception.message shouldBe "Command failed with exit code: 1. Error: "
            exception.exitCode shouldBe 1
        }
    })
