package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.authentication.SignInUseCase
import java.util.UUID
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class AuthenticationControllerTest {
    private val signIn = mock<SignInUseCase>()
    private val sessionCookies = mock<SessionCookieBuilder>()
    private val csrfCookies = mock<CsrfCookieBuilder>()
    private val mvc = MockMvcTestSupport.mvc(AuthenticationController(signIn, sessionCookies, csrfCookies))

    @Test
    fun `root sign in sends root command and sets both cookies`() {
        val session = MockModelFactory.session(contestId = null)
        whenever(signIn.execute(any())).thenReturn(session)
        whenever(sessionCookies.buildCookie(session)).thenReturn("session_id=session-cookie")
        whenever(csrfCookies.buildCookie(session)).thenReturn("csrf_token=csrf-cookie")

        mvc
            .perform(
                post("/v1/root:sign-in")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"password":"root-secret"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(session.id.toString()))
            .andExpect(
                header().stringValues(
                    HttpHeaders.SET_COOKIE,
                    "session_id=session-cookie",
                    "csrf_token=csrf-cookie",
                ),
            )

        verify(signIn).execute(
            SignInUseCase.Command(
                contestId = null,
                login = "root",
                password = "root-secret",
            ),
        )
    }

    @Test
    fun `contest sign in forwards route and credentials`() {
        val contestId = UUID.randomUUID()
        val session = MockModelFactory.session(contestId = contestId)
        whenever(signIn.execute(any())).thenReturn(session)
        whenever(sessionCookies.buildCookie(session)).thenReturn("session_id=session-cookie")
        whenever(csrfCookies.buildCookie(session)).thenReturn("csrf_token=csrf-cookie")

        mvc
            .perform(
                post("/v1/contests/$contestId:sign-in")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"login":"team-a","password":"secret"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.contestId").value(contestId.toString()))

        verify(signIn).execute(SignInUseCase.Command(contestId, "team-a", "secret"))
    }
}
