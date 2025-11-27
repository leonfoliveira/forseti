package live.forseti.infrastructure.adapter.driven.feign

import feign.RequestInterceptor
import feign.RequestTemplate
import feign.Retryer
import live.forseti.core.domain.model.RequestContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FeignConfig : RequestInterceptor {
    /**
     * Configure Feign retryer.
     */
    @Bean
    fun retryer(): Retryer = Retryer.Default(100, 1000, 3)

    /**
     * Add session cookie and trace id to outgoing requests.
     */
    override fun apply(template: RequestTemplate) {
        val session = RequestContext.getContext().session
        if (session != null) {
            template.header("Cookie", "session_id=${session.id}")
            template.header("X-CSRF-Token", session.csrfToken.toString())
        }
    }
}
