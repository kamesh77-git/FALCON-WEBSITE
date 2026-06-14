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
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long shipmentId;
    private String gcNo;
    private LocalDate invoiceDate;
    private BigDecimal invoiceAmount;
    private String remarks;
    private String generatedByName;
    private LocalDateTime createdAt;

    // Shipment summary info
    private String customer;
    private String destination;
    private BigDecimal totalFreight;
}
