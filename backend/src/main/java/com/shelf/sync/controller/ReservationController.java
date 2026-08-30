package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.ReservationRequest;
import com.shelf.sync.dto.ReservationResponse;
import com.shelf.sync.entity.ReservationStatus;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.exception.UnauthorizedException;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getAllReservations(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reservationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ReservationResponse> reservations = reservationService.searchReservations(memberId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Reservations retrieved successfully", reservations));
    }

    @GetMapping("/my-reservations")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getMyReservations(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reservationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        User currentUser = authService.getCurrentUserEntity();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ReservationResponse> reservations = reservationService.searchReservations(currentUser.getId(), status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("My reservations retrieved successfully", reservations));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(@PathVariable Long id) {
        ReservationResponse reservation = reservationService.getReservationById(id);
        User currentUser = authService.getCurrentUserEntity();

        if (currentUser.getRole() == Role.ROLE_MEMBER && !reservation.getMember().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this reservation");
        }

        return ResponseEntity.ok(ApiResponse.ok("Reservation details retrieved successfully", reservation));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(@Valid @RequestBody ReservationRequest request) {
        ReservationResponse created = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Book reserved successfully", created));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(@PathVariable Long id) {
        ReservationResponse cancelled = reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled successfully", cancelled));
    }

    @PostMapping("/{id}/fulfill")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<ReservationResponse>> fulfillReservation(@PathVariable Long id) {
        ReservationResponse fulfilled = reservationService.fulfillReservation(id);
        return ResponseEntity.ok(ApiResponse.ok("Reservation fulfilled successfully", fulfilled));
    }
}
