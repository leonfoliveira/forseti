package com.forsetijudge.api.adapter.dto.request.announcement

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateAnnouncementRequestBodyDTO(
    val text: String,
)
