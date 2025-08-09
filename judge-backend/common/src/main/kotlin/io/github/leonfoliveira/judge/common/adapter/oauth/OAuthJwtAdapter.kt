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
import java.time.ZoneOffset
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
    override fun buildAuthorization(member: Member): Authorization {
        val issuedAt = OffsetDateTime.now()
        val expiresAt = issuedAt.plusSeconds(
            if (member.type == Member.Type.ROOT) {
                UnitUtil.parseTimeValue(rootExpiration)
            } else {
                UnitUtil.parseTimeValue(expiration)
            } / 1000L,
        )

        return Authorization(
            member =
                AuthorizationMember(
                    id = member.id,
                    contestId = member.contest?.id,
                    name = member.name,
                    type = member.type,
                ),
            issuedAt = issuedAt,
            expiresAt = expiresAt,
        )
    }

    override fun encodeToken(authorization: Authorization): String {
        val algorithm = Algorithm.HMAC256(secret)

        val jwt =
            JWT
                .create()
                .withIssuedAt(authorization.issuedAt.toInstant())
                .withExpiresAt(authorization.expiresAt.toInstant())
                .withClaim("id", authorization.member.id.toString())
                .withClaim("name", authorization.member.name)
                .withClaim("type", authorization.member.type.toString())

        if (authorization.member.contestId != null) {
            jwt.withClaim("contestId", authorization.member.id.toString())
        }

        return jwt.sign(algorithm)
    }

    override fun decodeToken(token: String): Authorization {
        val algorithm = Algorithm.HMAC256(secret)
        val verifier = JWT.require(algorithm).build()
        val decoded = verifier.verify(token)

        return Authorization(
            member = AuthorizationMember(
                id = UUID.fromString(decoded.getClaim("id").asString()),
                contestId = decoded.getClaim("contestId").asString()?.let(UUID::fromString),
                name = decoded.getClaim("name").asString(),
                type = Member.Type.valueOf(decoded.getClaim("type").asString()),
            ),
            issuedAt = decoded.issuedAt.toInstant().atOffset(ZoneOffset.UTC),
            expiresAt = decoded.expiresAt.toInstant().atOffset(ZoneOffset.UTC),
        )
    }
}
