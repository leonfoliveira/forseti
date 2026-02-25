package com.forsetijudge.api.adapter.driving.http.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Suppress("unused")
class PingController {
    @GetMapping("/ping")
    fun ping(): String = "pong"
}
