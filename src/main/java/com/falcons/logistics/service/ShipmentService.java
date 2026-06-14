package com.falcons.logistics.service;

import com.falcons.logistics.dto.request.DeliveryDateUpdateRequest;
import com.falcons.logistics.dto.request.ShipmentAdminRequest;
import com.falcons.logistics.dto.request.ShipmentFinanceRequest;
import com.falcons.logistics.dto.request.ShipmentFullRequest;
import com.falcons.logistics.dto.response.ShipmentAdminResponse;
import com.falcons.logistics.dto.response.ShipmentFinanceResponse;
import com.falcons.logistics.dto.response.ShipmentFullResponse;
import com.falcons.logistics.entity.Shipment;
import com.falcons.logistics.entity.User;
import com.falcons.logistics.enums.ShipmentStatus;
import com.falcons.logistics.exception.BadRequestException;
import com.falcons.logistics.exception.DuplicateResourceException;
import com.falcons.logistics.exception.ResourceNotFoundException;
import com.falcons.logistics.repository.ShipmentRepository;
import com.falcons.logistics.repository.UserRepository;
import com.falcons.logistics.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== CREATE ====================

    @Transactional
    public ShipmentAdminResponse createByAdmin(ShipmentAdminRequest request) {
        validateGcNoUnique(request.getGcNo());

        Shipment shipment = new Shipment();
        mapAdminFieldsToEntity(request, shipment);
        shipment.setStatus(ShipmentStatus.NOT_DELIVERED);
        shipment.setCreatedBy(getCurrentUser());

        Shipment saved = shipmentRepository.save(shipment);
        return mapToAdminResponse(saved);
    }

    @Transactional
    public ShipmentFullResponse createFull(ShipmentFullRequest request) {
        validateGcNoUnique(request.getGcNo());

        Shipment shipment = new Shipment();
        mapFullFieldsToEntity(request, shipment);

        // Set status based on delivery date
        if (request.getDeliveryDate() != null) {
            shipment.setStatus(ShipmentStatus.DELIVERED);
        } else {
            shipment.setStatus(ShipmentStatus.NOT_DELIVERED);
        }

        shipment.setCreatedBy(getCurrentUser());

        Shipment saved = shipmentRepository.save(shipment);
        return mapToFullResponse(saved);
    }

    // ==================== READ ====================

    public List<ShipmentAdminResponse> getAllForAdmin() {
        return shipmentRepository.findAll().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentFinanceResponse> getAllForFinance() {
        return shipmentRepository.findAll().stream()
                .map(this::mapToFinanceResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentFullResponse> getAllFull() {
        return shipmentRepository.findAll().stream()
                .map(this::mapToFullResponse)
                .collect(Collectors.toList());
    }

    public ShipmentAdminResponse getByIdForAdmin(Long id) {
        Shipment shipment = findShipmentById(id);
        return mapToAdminResponse(shipment);
    }

    public ShipmentFinanceResponse getByIdForFinance(Long id) {
        Shipment shipment = findShipmentById(id);
        return mapToFinanceResponse(shipment);
    }

    public ShipmentFullResponse getByIdFull(Long id) {
        Shipment shipment = findShipmentById(id);
        return mapToFullResponse(shipment);
    }

    // ==================== NOT DELIVERED / DELIVERED ====================

    public List<ShipmentAdminResponse> getNotDeliveredForAdmin() {
        return shipmentRepository.findByStatus(ShipmentStatus.NOT_DELIVERED).stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentFullResponse> getNotDeliveredFull() {
        return shipmentRepository.findByStatus(ShipmentStatus.NOT_DELIVERED).stream()
                .map(this::mapToFullResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentFinanceResponse> getNotDeliveredForFinance() {
        return shipmentRepository.findByStatus(ShipmentStatus.NOT_DELIVERED).stream()
                .map(this::mapToFinanceResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentAdminResponse> getDeliveredForAdmin() {
        return shipmentRepository.findByStatusIn(
                List.of(ShipmentStatus.DELIVERED, ShipmentStatus.INVOICED)).stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentFullResponse> getDeliveredFull() {
        return shipmentRepository.findByStatusIn(
                List.of(ShipmentStatus.DELIVERED, ShipmentStatus.INVOICED)).stream()
                .map(this::mapToFullResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentFinanceResponse> getDeliveredForFinance() {
        return shipmentRepository.findByStatusIn(
                List.of(ShipmentStatus.DELIVERED, ShipmentStatus.INVOICED)).stream()
                .map(this::mapToFinanceResponse)
                .collect(Collectors.toList());
    }

    // ==================== UPDATE ====================

    @Transactional
    public ShipmentAdminResponse updateDeliveryDate(Long id, DeliveryDateUpdateRequest request) {
        Shipment shipment = findShipmentById(id);

        if (shipment.getStatus() == ShipmentStatus.INVOICED) {
            throw new BadRequestException("Cannot update delivery date for an invoiced shipment.");
        }

        shipment.setDeliveryDate(request.getDeliveryDate());
        shipment.setStatus(ShipmentStatus.DELIVERED);

        Shipment saved = shipmentRepository.save(shipment);
        return mapToAdminResponse(saved);
    }

    @Transactional
    public ShipmentFinanceResponse updateFinance(Long id, ShipmentFinanceRequest request) {
        Shipment shipment = findShipmentById(id);

        mapFinanceFieldsToEntity(request, shipment);

        Shipment saved = shipmentRepository.save(shipment);
        return mapToFinanceResponse(saved);
    }

    @Transactional
    public ShipmentFullResponse updateFull(Long id, ShipmentFullRequest request) {
        Shipment shipment = findShipmentById(id);

        // Check if GC No is changing and if new one is unique
        if (!shipment.getGcNo().equals(request.getGcNo())) {
            validateGcNoUnique(request.getGcNo());
        }

        mapFullFieldsToEntity(request, shipment);

        // Update status based on delivery date
        if (request.getDeliveryDate() != null && shipment.getStatus() == ShipmentStatus.NOT_DELIVERED) {
            shipment.setStatus(ShipmentStatus.DELIVERED);
        }

        Shipment saved = shipmentRepository.save(shipment);
        return mapToFullResponse(saved);
    }

    // ==================== DELETE ====================

    @Transactional
    public void delete(Long id) {
        Shipment shipment = findShipmentById(id);
        shipmentRepository.delete(shipment);
    }

    // ==================== HELPERS ====================

    private Shipment findShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", id));
    }

    private void validateGcNoUnique(String gcNo) {
        if (shipmentRepository.existsByGcNo(gcNo)) {
            throw new DuplicateResourceException("Shipment", "GC No", gcNo);
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
    }

    // ==================== MAPPERS ====================

    private void mapAdminFieldsToEntity(ShipmentAdminRequest request, Shipment shipment) {
        shipment.setMonth(request.getMonth());
        shipment.setCustomer(request.getCustomer());
        shipment.setBookingPlace(request.getBookingPlace());
        shipment.setVendorName(request.getVendorName());
        shipment.setShipmentDate(request.getShipmentDate());
        shipment.setTruckNo(request.getTruckNo());
        shipment.setGcNo(request.getGcNo());
        shipment.setDestination(request.getDestination());
        shipment.setTruckType(request.getTruckType());
        shipment.setFreight(request.getFreight());
        shipment.setAdditionalCharges(request.getAdditionalCharges());
        shipment.setTotalFreight(request.getTotalFreight());
    }

    private void mapFinanceFieldsToEntity(ShipmentFinanceRequest request, Shipment shipment) {
        shipment.setLoadingCharge(request.getLoadingCharge());
        shipment.setVendorFreight(request.getVendorFreight());
        shipment.setHaltCharge(request.getHaltCharge());
        shipment.setUnloadingCharge(request.getUnloadingCharge());
        shipment.setDiesel(request.getDiesel());
        shipment.setRtgsAmount(request.getRtgsAmount());
        shipment.setRtgsDate(request.getRtgsDate());
        shipment.setMamul(request.getMamul());
        shipment.setBalance(request.getBalance());
        shipment.setIncome(request.getIncome());
    }

    private void mapFullFieldsToEntity(ShipmentFullRequest request, Shipment shipment) {
        // Admin fields (A–M)
        shipment.setMonth(request.getMonth());
        shipment.setCustomer(request.getCustomer());
        shipment.setBookingPlace(request.getBookingPlace());
        shipment.setVendorName(request.getVendorName());
        shipment.setShipmentDate(request.getShipmentDate());
        shipment.setTruckNo(request.getTruckNo());
        shipment.setGcNo(request.getGcNo());
        shipment.setDeliveryDate(request.getDeliveryDate());
        shipment.setDestination(request.getDestination());
        shipment.setTruckType(request.getTruckType());
        shipment.setFreight(request.getFreight());
        shipment.setAdditionalCharges(request.getAdditionalCharges());
        shipment.setTotalFreight(request.getTotalFreight());

        // Finance fields (N–W)
        shipment.setLoadingCharge(request.getLoadingCharge());
        shipment.setVendorFreight(request.getVendorFreight());
        shipment.setHaltCharge(request.getHaltCharge());
        shipment.setUnloadingCharge(request.getUnloadingCharge());
        shipment.setDiesel(request.getDiesel());
        shipment.setRtgsAmount(request.getRtgsAmount());
        shipment.setRtgsDate(request.getRtgsDate());
        shipment.setMamul(request.getMamul());
        shipment.setBalance(request.getBalance());
        shipment.setIncome(request.getIncome());
    }

    private ShipmentAdminResponse mapToAdminResponse(Shipment shipment) {
        ShipmentAdminResponse response = new ShipmentAdminResponse();
        response.setId(shipment.getId());
        response.setMonth(shipment.getMonth());
        response.setCustomer(shipment.getCustomer());
        response.setBookingPlace(shipment.getBookingPlace());
        response.setVendorName(shipment.getVendorName());
        response.setShipmentDate(shipment.getShipmentDate());
        response.setTruckNo(shipment.getTruckNo());
        response.setGcNo(shipment.getGcNo());
        response.setDeliveryDate(shipment.getDeliveryDate());
        response.setDestination(shipment.getDestination());
        response.setTruckType(shipment.getTruckType());
        response.setFreight(shipment.getFreight());
        response.setAdditionalCharges(shipment.getAdditionalCharges());
        response.setTotalFreight(shipment.getTotalFreight());
        response.setStatus(shipment.getStatus().name());
        return response;
    }

    private ShipmentFinanceResponse mapToFinanceResponse(Shipment shipment) {
        ShipmentFinanceResponse response = new ShipmentFinanceResponse();
        response.setId(shipment.getId());
        response.setGcNo(shipment.getGcNo());
        response.setCustomer(shipment.getCustomer());
        response.setDestination(shipment.getDestination());
        response.setTotalFreight(shipment.getTotalFreight());
        response.setLoadingCharge(shipment.getLoadingCharge());
        response.setVendorFreight(shipment.getVendorFreight());
        response.setHaltCharge(shipment.getHaltCharge());
        response.setUnloadingCharge(shipment.getUnloadingCharge());
        response.setDiesel(shipment.getDiesel());
        response.setRtgsAmount(shipment.getRtgsAmount());
        response.setRtgsDate(shipment.getRtgsDate());
        response.setMamul(shipment.getMamul());
        response.setBalance(shipment.getBalance());
        response.setIncome(shipment.getIncome());
        response.setStatus(shipment.getStatus().name());
        return response;
    }

    private ShipmentFullResponse mapToFullResponse(Shipment shipment) {
        ShipmentFullResponse response = new ShipmentFullResponse();
        response.setId(shipment.getId());

        // A–M
        response.setMonth(shipment.getMonth());
        response.setCustomer(shipment.getCustomer());
        response.setBookingPlace(shipment.getBookingPlace());
        response.setVendorName(shipment.getVendorName());
        response.setShipmentDate(shipment.getShipmentDate());
        response.setTruckNo(shipment.getTruckNo());
        response.setGcNo(shipment.getGcNo());
        response.setDeliveryDate(shipment.getDeliveryDate());
        response.setDestination(shipment.getDestination());
        response.setTruckType(shipment.getTruckType());
        response.setFreight(shipment.getFreight());
        response.setAdditionalCharges(shipment.getAdditionalCharges());
        response.setTotalFreight(shipment.getTotalFreight());

        // N–W
        response.setLoadingCharge(shipment.getLoadingCharge());
        response.setVendorFreight(shipment.getVendorFreight());
        response.setHaltCharge(shipment.getHaltCharge());
        response.setUnloadingCharge(shipment.getUnloadingCharge());
        response.setDiesel(shipment.getDiesel());
        response.setRtgsAmount(shipment.getRtgsAmount());
        response.setRtgsDate(shipment.getRtgsDate());
        response.setMamul(shipment.getMamul());
        response.setBalance(shipment.getBalance());
        response.setIncome(shipment.getIncome());

        // System
        response.setStatus(shipment.getStatus().name());
        response.setCreatedByName(shipment.getCreatedBy() != null ? shipment.getCreatedBy().getName() : null);
        response.setCreatedAt(shipment.getCreatedAt());
        response.setUpdatedAt(shipment.getUpdatedAt());

        return response;
    }
}
