package com.shelf.sync.repository;

import com.shelf.sync.entity.Loan;
import com.shelf.sync.entity.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByMemberIdAndStatus(Long memberId, LoanStatus status);

    long countByMemberIdAndStatus(Long memberId, LoanStatus status);

    long countByStatus(LoanStatus status);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    List<Loan> findOverdueActiveLoans(@Param("today") LocalDate today);

    @Query("SELECT l FROM Loan l " +
           "JOIN FETCH l.member " +
           "JOIN FETCH l.book b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.category " +
           "WHERE (:memberId IS NULL OR l.member.id = :memberId) " +
           "  AND (:status IS NULL OR l.status = :status) " +
           "  AND (:search IS NULL OR " +
           "       LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(l.member.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(l.member.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(l.member.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Loan> searchLoans(@Param("memberId") Long memberId,
                           @Param("status") LoanStatus status,
                           @Param("search") String search,
                           Pageable pageable);
}
