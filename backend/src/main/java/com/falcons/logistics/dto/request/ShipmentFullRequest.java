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
public class ShipmentFullRequest {

    // Columns A–M
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

    private LocalDate deliveryDate;

    private String destination;

    private String truckType;

    private BigDecimal freight;

    private BigDecimal additionalCharges;

    private BigDecimal totalFreight;

    // Columns N–W
    private BigDecimal loadingCharge;

    private BigDecimal vendorFreight;

    private BigDecimal haltCharge;

    private BigDecimal unloadingCharge;

    private BigDecimal diesel;

    private BigDecimal rtgsAmount;

    private LocalDate rtgsDate;

    private BigDecimal mamul;

    private BigDecimal balance;

    private BigDecimal income;
}
