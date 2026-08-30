package com.shelf.sync.repository;

import com.shelf.sync.entity.Reservation;
import com.shelf.sync.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByMemberIdAndBookIdAndStatus(Long memberId, Long bookId, ReservationStatus status);

    boolean existsByMemberIdAndBookIdAndStatus(Long memberId, Long bookId, ReservationStatus status);

    List<Reservation> findByBookIdAndStatusOrderByReservationDateAsc(Long bookId, ReservationStatus status);

    long countByStatus(ReservationStatus status);

    long countByMemberIdAndStatus(Long memberId, ReservationStatus status);

    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.member " +
           "JOIN FETCH r.book b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.category " +
           "WHERE (:memberId IS NULL OR r.member.id = :memberId) " +
           "  AND (:status IS NULL OR r.status = :status) " +
           "  AND (:search IS NULL OR " +
           "       LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(r.member.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(r.member.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(r.member.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Reservation> searchReservations(@Param("memberId") Long memberId,
                                         @Param("status") ReservationStatus status,
                                         @Param("search") String search,
                                         Pageable pageable);
}
