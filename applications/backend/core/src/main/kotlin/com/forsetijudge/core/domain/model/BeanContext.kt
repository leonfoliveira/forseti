package com.forsetijudge.core.domain.model

import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Component

@Component
class BeanContext : ApplicationContextAware {
    override fun setApplicationContext(context: ApplicationContext) {
        instance = context
    }

    companion object {
        private lateinit var instance: ApplicationContext

        fun <T> getBean(clazz: Class<T>): T = instance.getBean(clazz)

        inline fun <reified T> getBean(): T = getBean(T::class.java)
    }
}
