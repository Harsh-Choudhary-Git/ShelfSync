package com.shelf.sync.service;

import com.shelf.sync.dto.ReservationRequest;
import com.shelf.sync.dto.ReservationResponse;
import com.shelf.sync.entity.*;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.exception.UnauthorizedException;
import com.shelf.sync.repository.BookRepository;
import com.shelf.sync.repository.LoanRepository;
import com.shelf.sync.repository.ReservationRepository;
import com.shelf.sync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public Page<ReservationResponse> searchReservations(Long memberId, ReservationStatus status, String search, Pageable pageable) {
        Page<Reservation> page = reservationRepository.searchReservations(memberId, status, search, pageable);
        return page.map(this::enrichReservationResponse);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        return enrichReservationResponse(reservation);
    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        User member;

        // If memberId is specified and current user is Admin/Librarian, allow reserving for member
        if (request.getMemberId() != null &&
                (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_LIBRARIAN)) {
            member = userRepository.findById(request.getMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getMemberId()));
        } else {
            member = currentUser;
        }

        if (member.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Member account is inactive. Cannot place reservations.");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        // Prevent duplicate active reservation for the same member and book
        if (reservationRepository.existsByMemberIdAndBookIdAndStatus(member.getId(), book.getId(), ReservationStatus.ACTIVE)) {
            throw new ConflictException("You already have an active reservation for this book: " + book.getTitle());
        }

        // Check if member already has this book borrowed
        List<Loan> memberActiveLoans = loanRepository.findByMemberIdAndStatus(member.getId(), LoanStatus.ACTIVE);
        boolean alreadyHasBook = memberActiveLoans.stream()
                .anyMatch(l -> l.getBook().getId().equals(book.getId()));
        if (alreadyHasBook) {
            throw new BadRequestException("You currently have an active loan for this book");
        }

        Reservation reservation = new Reservation();
        reservation.setMember(member);
        reservation.setBook(book);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setExpiryDate(LocalDateTime.now().plusDays(7));
        reservation.setStatus(ReservationStatus.ACTIVE);

        Reservation saved = reservationRepository.save(reservation);
        return enrichReservationResponse(saved);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        User currentUser = authService.getCurrentUserEntity();
        if (currentUser.getRole() == Role.ROLE_MEMBER && !reservation.getMember().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only cancel your own reservations");
        }

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new BadRequestException("Only active reservations can be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation updated = reservationRepository.save(reservation);
        return enrichReservationResponse(updated);
    }

    @Transactional
    public ReservationResponse fulfillReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new BadRequestException("Only active reservations can be fulfilled");
        }

        reservation.setStatus(ReservationStatus.FULFILLED);
        Reservation updated = reservationRepository.save(reservation);
        return enrichReservationResponse(updated);
    }

    private ReservationResponse enrichReservationResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse(reservation);
        if (reservation.getStatus() == ReservationStatus.ACTIVE) {
            List<Reservation> activeForBook = reservationRepository
                    .findByBookIdAndStatusOrderByReservationDateAsc(reservation.getBook().getId(), ReservationStatus.ACTIVE);
            int position = 1;
            for (Reservation r : activeForBook) {
                if (r.getId().equals(reservation.getId())) {
                    response.setQueuePosition(position);
                    break;
                }
                position++;
            }
        }
        return response;
    }
}
