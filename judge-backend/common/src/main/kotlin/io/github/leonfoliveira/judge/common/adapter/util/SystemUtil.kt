package io.github.leonfoliveira.judge.common.adapter.util

object SystemUtil {
    fun normalizeCommand(command: Array<String>): Array<String> {
        return if (isWindows()) {
            arrayOf("wsl.exe", *command)
        } else {
            command
        }
    }

    fun normalizePath(path: String): String {
        if (isWindows()) {
            return CommandRunner.run(arrayOf("wslpath", path.replace("\\", "\\\\"))).trim()
        }
        return path
    }

    private fun isWindows(): Boolean {
        return System.getProperty("os.name").startsWith("Windows")
    }
}
