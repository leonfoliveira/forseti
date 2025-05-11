package io.leonfoliveira.judge.core.entity.model

data class Authorization(
    val claims: Claims,
    val token: String,
) {
    data class Claims(
        val id: Int,
        val name: String,
        val login: String,
    ) {
        companion object {
            val ROOT = Claims(
                id = 0,
                name = "root",
                login = "root",
            )
        }
    }
}
