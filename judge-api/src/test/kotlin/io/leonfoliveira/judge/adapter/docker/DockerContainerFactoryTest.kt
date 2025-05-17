package io.leonfoliveira.judge.adapter.docker

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.adapter.util.CommandRunner
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.io.File

class DockerContainerFactoryTest : FunSpec({
    val validFile = mockk<File>()
    every { validFile.absolutePath } returns "/valid/path"

    beforeEach {
        mockkObject(CommandRunner)
    }

    test("should create container") {
        val name = "test-container"
        every { CommandRunner.run(any()) } returns name

        val container = DockerContainerFactory.create("test-image", "test-container", validFile)

        container.name shouldBe name
    }
})
