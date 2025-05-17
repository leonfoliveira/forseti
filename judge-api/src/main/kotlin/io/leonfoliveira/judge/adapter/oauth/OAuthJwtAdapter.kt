package io.leonfoliveira.judge.adapter.oauth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.AuthorizationMember
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.ZoneOffset

@Service
class OAuthJwtAdapter(
    @Value("\${security.jwt.secret}")
    private val secret: String,
    @Value("\${security.jwt.expiration}")
    private val expiration: Long = 0L,
    @Value("\${security.jwt.root-expiration}")
    private val rootExpiration: Long = 0L,
) : JwtAdapter {
    override fun generateToken(authorization: AuthorizationMember): String {
        val algorithm = Algorithm.HMAC256(secret)
        val now = TimeUtils.now().toInstant(ZoneOffset.UTC)
        val expirationAt =
            now.plusSeconds(
                if (authorization.type == Member.Type.ROOT) {
                    rootExpiration
                } else {
                    expiration
                },
            )

        val jwt =
            JWT
                .create()
                .withIssuedAt(now)
                .withExpiresAt(expirationAt)
                .withClaim("id", authorization.id)
                .withClaim("name", authorization.name)
                .withClaim("login", authorization.login)
                .withClaim("type", authorization.type.toString())

        return jwt.sign(algorithm)
    }

    override fun decodeToken(token: String): AuthorizationMember {
        val algorithm = Algorithm.HMAC256(secret)
        val verifier = JWT.require(algorithm).build()
        val decoded = verifier.verify(token)

        return AuthorizationMember(
            id = decoded.getClaim("id").asInt(),
            name = decoded.getClaim("name").asString(),
            login = decoded.getClaim("login").asString(),
            type = Member.Type.valueOf(decoded.getClaim("type").asString()),
        )
    }
}
