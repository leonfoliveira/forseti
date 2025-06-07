package io.leonfoliveira.judge.core.domain.model

import io.leonfoliveira.judge.core.domain.entity.Member
import java.util.UUID

data class AuthorizationMember(
    val id: UUID,
    val name: String,
    val login: String,
    val type: Member.Type,
) {
    companion object {
        val ROOT =
            AuthorizationMember(
                id = UUID.fromString("00000000-0000-0000-0000-000000000000"),
                name = "root",
                login = "root",
                type = Member.Type.ROOT,
            )
    }
}
