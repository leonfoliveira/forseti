package io.leonfoliveira.judge.adapter.oauth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.Authorization
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
) : JwtAdapter {
    override fun generateToken(authorization: Authorization): String {
        val algorithm = Algorithm.HMAC256(secret)
        val now = TimeUtils.now().toInstant(ZoneOffset.UTC)
        val expirationAt = now.plusSeconds(expiration)

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

    override fun decodeToken(token: String): Authorization {
        val algorithm = Algorithm.HMAC256(secret)
        val verifier = JWT.require(algorithm).build()
        val decoded = verifier.verify(token)

        return Authorization(
            id = decoded.getClaim("id").asInt(),
            name = decoded.getClaim("name").asString(),
            login = decoded.getClaim("login").asString(),
            type = Member.Type.valueOf(decoded.getClaim("type").asString()),
        )
    }
}
