package io.leonfoliveira.judge.adapter.jjwt

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.model.Authorization
import io.leonfoliveira.judge.core.port.JwtAdapter
import io.leonfoliveira.judge.core.util.TimeUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.Key
import java.time.ZoneId
import java.util.Base64
import java.util.Date

@Service
class JjwtJwtAdapter : JwtAdapter {
    @Value("\${security.jwt.secret}")
    private lateinit var secret: String

    @Value("\${security.jwt.expiration}")
    private var expiration: Long = 0L

    private val key: Key by lazy {
        val secretBytes: ByteArray = Base64.getEncoder().encode(secret.toByteArray())
        Keys.hmacShaKeyFor(secretBytes)
    }

    override fun generateToken(claims: Authorization): String {
        val now = Date.from(TimeUtils.now().atZone(ZoneId.of("UTC")).toInstant())
        return Jwts.builder()
            .claim("id", claims.id)
            .claim("name", claims.name)
            .claim("login", claims.login)
            .setIssuedAt(now)
            .setExpiration(Date(now.time + expiration * 1000))
            .signWith(key)
            .compact()
    }

    override fun validateToken(token: String): Boolean {
        return try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parse(token)
            true
        } catch (ex: JwtException) {
            false
        }
    }

    override fun decodeToken(token: String): Authorization {
        val claims =
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .body

        return Authorization(
            id = claims["id"] as Int,
            name = claims["name"] as String,
            login = claims["login"] as String,
            type = Member.Type.valueOf(claims["type"] as String),
        )
    }
}
