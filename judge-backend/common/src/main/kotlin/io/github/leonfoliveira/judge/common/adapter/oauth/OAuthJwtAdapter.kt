package io.github.leonfoliveira.judge.common.adapter.oauth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import io.github.leonfoliveira.judge.common.util.UnitUtil
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.UUID

@Service
class OAuthJwtAdapter(
    @Value("\${security.jwt.secret}")
    private val secret: String,
    @Value("\${security.jwt.expiration}")
    private val expiration: String,
    @Value("\${security.jwt.root-expiration}")
    private val rootExpiration: String,
) : JwtAdapter {
    override fun generateAuthorization(member: Member): Authorization {
        val algorithm = Algorithm.HMAC256(secret)
        val now = OffsetDateTime.now().toInstant()
        val expiresAt =
            now.plusMillis(
                if (member.type == Member.Type.ROOT) {
                    UnitUtil.parseTimeValue(rootExpiration).toLong()
                } else {
                    UnitUtil.parseTimeValue(expiration).toLong()
                },
            )

        val jwt =
            JWT
                .create()
                .withIssuedAt(now)
                .withExpiresAt(expiresAt)
                .withClaim("id", member.id.toString())
                .withClaim("name", member.name)
                .withClaim("type", member.type.toString())

        if (member.contest != null) {
            jwt.withClaim("contestId", member.contest.id.toString())
        }

        val token = jwt.sign(algorithm)
        return Authorization(
            member =
                AuthorizationMember(
                    id = member.id,
                    contestId = member.contest?.id,
                    name = member.name,
                    type = member.type,
                ),
            accessToken = token,
            expiresAt = expiresAt.atOffset(OffsetDateTime.now().offset),
        )
    }

    override fun decodeToken(token: String): AuthorizationMember {
        val algorithm = Algorithm.HMAC256(secret)
        val verifier = JWT.require(algorithm).build()
        val decoded = verifier.verify(token)

        return AuthorizationMember(
            id = UUID.fromString(decoded.getClaim("id").asString()),
            contestId = decoded.getClaim("contestId").asString()?.let(UUID::fromString),
            name = decoded.getClaim("name").asString(),
            type = Member.Type.valueOf(decoded.getClaim("type").asString()),
        )
    }
}
