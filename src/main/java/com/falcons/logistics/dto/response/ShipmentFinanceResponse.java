package com.falcons.logistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentFinanceResponse {

    private Long id;
    private String gcNo;
    private String customer;
    private String destination;
    private BigDecimal totalFreight;
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
    private String status;
}
