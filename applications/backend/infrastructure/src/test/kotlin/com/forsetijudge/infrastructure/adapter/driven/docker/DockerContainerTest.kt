package com.forsetijudge.infrastructure.adapter.driven.docker

import com.forsetijudge.infrastructure.adapter.util.command.CommandRunner
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.verify

class DockerContainerTest :
    FunSpec({
        beforeEach {
            mockkObject(CommandRunner)
            every { CommandRunner.run(any()) } returns ""
            every { CommandRunner.run(any(), any()) } returns ""
        }

        context("create") {
            test("should create a docker container with the given parameters") {
                val image = "test-image"
                val name = "test-container"
                val flags = arrayOf("--rm", "--network=none")
                val cmd = arrayOf("sleep", "infinity")

                DockerContainer.create(
                    image = image,
                    name = name,
                    flags = flags,
                    cmd = cmd,
                )

                verify {
                    CommandRunner.run(
                        arrayOf(
                            "docker",
                            "create",
                            "--rm",
                            "--network=none",
                            "--name=test-container",
                            "test-image",
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

                container.exec(command, null)

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

            test("should execute a command in the docker container with stdin") {
                val container = DockerContainer("test-container")
                val command = arrayOf("echo", "Hello, World!")
                val stdin = "Input data"

                container.exec(command, stdin)

                verify {
                    CommandRunner.run(
                        arrayOf(
                            "docker",
                            "exec",
                            "-i",
                            "test-container",
                            *command,
                        ),
                        stdin,
                    )
                }
            }
        }
    })
