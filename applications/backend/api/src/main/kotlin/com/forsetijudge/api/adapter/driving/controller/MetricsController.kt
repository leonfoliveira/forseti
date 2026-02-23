package com.forsetijudge.api.adapter.driving.controller

import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
class MetricsController {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/metrics")
    fun metrics() {
        logger.info("[GET] /v1/metrics")
    }
}
