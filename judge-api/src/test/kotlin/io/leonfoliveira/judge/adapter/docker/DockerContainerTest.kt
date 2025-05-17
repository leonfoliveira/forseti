package io.leonfoliveira.judge.adapter.docker

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.adapter.util.CommandRunner
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.verify

class DockerContainerTest : FunSpec({
    val containerName = "test-container"
    val container = DockerContainer(containerName)

    beforeEach {
        mockkObject(CommandRunner)
    }

    test("should start container") {
        every { CommandRunner.run(arrayOf("docker", "start", containerName)) } returns ""

        container.start()

        verify { CommandRunner.run(arrayOf("docker", "start", containerName)) }
    }

    test("should kill container") {
        every { CommandRunner.run(arrayOf("docker", "kill", containerName)) } returns ""

        container.kill()

        verify { CommandRunner.run(arrayOf("docker", "kill", containerName)) }
    }

    test("should execute command in container") {
        val command = arrayOf("echo", "hello")
        val input = "input-data"
        val output = "hello"
        every { CommandRunner.run(arrayOf("docker", "exec", "-i", containerName, *command), input) } returns output

        val result = container.exec(command, input, 1000L)

        result shouldBe output
    }

    test("should execute command in container without optional params") {
        val command = arrayOf("echo", "hello")
        val output = "hello"
        every { CommandRunner.run(arrayOf("docker", "exec", "-i", containerName, *command)) } returns output

        val result = container.exec(arrayOf("echo", "hello"))

        result shouldBe output
    }
})
