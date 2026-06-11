package com.falcons.logistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentFullResponse {

    private Long id;

    // Columns A–M
    private String month;
    private String customer;
    private String bookingPlace;
    private String vendorName;
    private LocalDate shipmentDate;
    private String truckNo;
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

    // System fields
    private String status;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
