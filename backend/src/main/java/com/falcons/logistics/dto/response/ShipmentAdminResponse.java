package com.falcons.logistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentAdminResponse {

    private Long id;
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
    private String status;
}
