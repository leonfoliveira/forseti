package io.leonfoliveira.judge.core.domain.model

import io.leonfoliveira.judge.core.domain.entity.Member

data class Authorization(
    val id: Int,
    val name: String,
    val login: String,
    val type: Member.Type,
) {
    companion object {
        val ROOT =
            Authorization(
                id = 0,
                name = "root",
                login = "root",
                type = Member.Type.ROOT,
            )
    }
}
