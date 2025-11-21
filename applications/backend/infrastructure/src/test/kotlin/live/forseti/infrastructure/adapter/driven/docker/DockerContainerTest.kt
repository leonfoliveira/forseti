package live.forseti.infrastructure.adapter.driven.docker

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.verify
import live.forseti.infrastructure.adapter.util.command.CommandError
import live.forseti.infrastructure.adapter.util.command.CommandRunner

class DockerContainerTest :
    FunSpec({
        beforeEach {
            mockkObject(CommandRunner)
            every { CommandRunner.run(any()) } returns ""
            every { CommandRunner.run(any(), any()) } returns ""
        }

        context("create") {
            test("should create a docker container with the given parameters") {
                val imageName = "test-image"
                val memoryLimit = 512
                val name = "test-container"

                DockerContainer.create(imageName, memoryLimit, name)

                verify {
                    CommandRunner.run(
                        arrayOf(
                            "docker",
                            "create",
                            "--rm",
                            "--network=none",
                            "--cap-drop=ALL",
                            "--security-opt=no-new-privileges",
                            "--pids-limit=64",
                            "--cpus=1",
                            "--memory=${memoryLimit}m",
                            "--memory-swap=${memoryLimit}m",
                            "--name=$name",
                            imageName,
                            "sleep",
                            "infinity",
                        ),
                    )
                }
            }
        }

        context("start") {
            test("should start the docker container") {
                val container = DockerContainer("test-container")
                container.start()

                verify { CommandRunner.run(arrayOf("docker", "start", "test-container")) }
            }
        }

        context("kill") {
            test("should kill the docker container") {
                val container = DockerContainer("test-container")
                container.kill()

                verify { CommandRunner.run(arrayOf("docker", "kill", "test-container")) }
            }
        }

        context("exec") {
            test("should execute a command in the docker container") {
                val container = DockerContainer("test-container")
                val command = arrayOf("echo", "Hello, World!")

                container.exec(command, null, null)

                verify {
                    CommandRunner.run(
                        arrayOf(
                            "docker",
                            "exec",
                            "-i",
                            "test-container",
                            *command,
                        ),
                        null,
                    )
                }
            }

            test("should execute a command in the docker container with input and time limit") {
                val container = DockerContainer("test-container")
                val command = arrayOf("echo", "Hello, World!")
                val input = "Input data"
                val timeLimit = 2500

                container.exec(command, input, timeLimit)

                verify {
                    CommandRunner.run(
                        arrayOf(
                            "timeout",
                            "--kill-after=1s",
                            "2.5s",
                            "docker",
                            "exec",
                            "-i",
                            "test-container",
                            *command,
                        ),
                        input,
                    )
                }
            }

            listOf(
                Pair(124, DockerContainer.DockerTimeOutException::class),
                Pair(137, DockerContainer.DockerOOMKilledException::class),
                Pair(1, CommandError::class),
            ).forEach { (exitCode, expectedExceptionClass) ->
                test("should throw ${expectedExceptionClass.simpleName} for exit code $exitCode") {
                    val container = DockerContainer("test-container")
                    val command = arrayOf("echo", "Hello, World!")

                    every { CommandRunner.run(any(), any()) } throws CommandError("Error message", exitCode)

                    shouldThrow<Throwable> {
                        container.exec(command, null, 5000)
                    }.apply {
                        this::class shouldBe expectedExceptionClass
                    }
                }
            }

            test("should throw DockerOOMKilledException on java.lang.OutOfMemoryError") {
                val container = DockerContainer("test-container")
                val command = arrayOf("echo", "Hello, World!")

                every { CommandRunner.run(any(), any()) } throws CommandError("java.lang.OutOfMemoryError", 1)

                shouldThrow<DockerContainer.DockerOOMKilledException> {
                    container.exec(command, null, 5000)
                }
            }
        }
    })
