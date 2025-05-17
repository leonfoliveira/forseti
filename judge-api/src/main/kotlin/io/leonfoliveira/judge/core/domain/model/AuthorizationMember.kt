package io.leonfoliveira.judge.core.domain.model

import io.leonfoliveira.judge.core.domain.entity.Member

data class AuthorizationMember(
    val id: Int,
    val name: String,
    val login: String,
    val type: Member.Type,
) {
    companion object {
        val ROOT =
            AuthorizationMember(
                id = 0,
                name = "root",
                login = "root",
                type = Member.Type.ROOT,
            )
    }
}
