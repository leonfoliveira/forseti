package com.forsetijudge.core.config.logging

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.classic.spi.IThrowableProxy
import ch.qos.logback.classic.spi.LoggerContextVO
import com.forsetijudge.core.config.SkipCoverage
import org.slf4j.Marker
import org.slf4j.event.KeyValuePair

/**
 * Wrapper for ILoggingEvent that allows message modification while preserving all other event properties.
 */
@SkipCoverage
class SanitizedLoggingEvent(
    private val originalEvent: ILoggingEvent,
    private val sanitizedMessage: String,
) : ILoggingEvent {
    override fun getMessage(): String = sanitizedMessage

    override fun getThreadName(): String = originalEvent.threadName

    override fun getLevel(): Level = originalEvent.level

    override fun getLoggerName(): String = originalEvent.loggerName

    override fun getLoggerContextVO(): LoggerContextVO = originalEvent.loggerContextVO

    override fun getThrowableProxy(): IThrowableProxy? = originalEvent.throwableProxy

    override fun getCallerData(): Array<StackTraceElement> = originalEvent.callerData

    override fun hasCallerData(): Boolean = originalEvent.hasCallerData()

    override fun getMarkerList(): List<Marker?>? = originalEvent.markerList

    override fun getMDCPropertyMap(): MutableMap<String, String> = originalEvent.mdcPropertyMap

    @Deprecated("Deprecated in Java")
    override fun getMdc(): MutableMap<String, String> = originalEvent.mdc

    override fun getTimeStamp(): Long = originalEvent.timeStamp

    override fun getNanoseconds(): Int = originalEvent.nanoseconds

    override fun getSequenceNumber(): Long = originalEvent.sequenceNumber

    override fun getFormattedMessage(): String = sanitizedMessage

    override fun getArgumentArray(): Array<Any>? = originalEvent.argumentArray

    override fun getKeyValuePairs(): MutableList<KeyValuePair>? = originalEvent.keyValuePairs

    override fun prepareForDeferredProcessing() {
        originalEvent.prepareForDeferredProcessing()
    }
}
