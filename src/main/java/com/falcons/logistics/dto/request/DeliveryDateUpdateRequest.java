package com.falcons.logistics.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDateUpdateRequest {

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;
}
