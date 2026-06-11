package com.falcons.logistics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentAdminRequest {

    @NotBlank(message = "Month is required")
    private String month;

    @NotBlank(message = "Customer is required")
    private String customer;

    private String bookingPlace;

    private String vendorName;

    private LocalDate shipmentDate;

    private String truckNo;

    @NotBlank(message = "GC No is required")
    private String gcNo;

    private String destination;

    private String truckType;

    private BigDecimal freight;

    private BigDecimal additionalCharges;

    private BigDecimal totalFreight;
}
