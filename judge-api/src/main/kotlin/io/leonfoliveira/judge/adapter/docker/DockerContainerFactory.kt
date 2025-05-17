package io.leonfoliveira.judge.adapter.docker

import io.leonfoliveira.judge.adapter.util.CommandRunner
import java.io.File

object DockerContainerFactory {
    fun create(
        imageName: String,
        name: String,
        volume: File,
    ): DockerContainer {
        CommandRunner.run(
            arrayOf(
                "docker",
                "create",
                "--rm",
                "--name",
                name,
                "-v",
                "${volume.absolutePath}:/app",
                imageName,
                "sleep",
                "infinity",
            ),
        )
        return DockerContainer(name)
    }
}
