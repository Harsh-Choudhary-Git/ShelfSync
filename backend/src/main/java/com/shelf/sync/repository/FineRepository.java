package com.shelf.sync.repository;

import com.shelf.sync.entity.Fine;
import com.shelf.sync.entity.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByMemberIdAndStatus(Long memberId, FineStatus status);

    long countByStatus(FineStatus status);

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fine f WHERE f.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") FineStatus status);

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fine f WHERE f.member.id = :memberId AND f.status = :status")
    BigDecimal sumAmountByMemberIdAndStatus(@Param("memberId") Long memberId, @Param("status") FineStatus status);

    @Query("SELECT f FROM Fine f " +
           "JOIN FETCH f.member " +
           "LEFT JOIN FETCH f.loan l " +
           "LEFT JOIN FETCH l.book b " +
           "WHERE (:memberId IS NULL OR f.member.id = :memberId) " +
           "  AND (:status IS NULL OR f.status = :status) " +
           "  AND (:search IS NULL OR " +
           "       LOWER(f.reason) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(f.member.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(f.member.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(f.member.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       (b IS NOT NULL AND LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Fine> searchFines(@Param("memberId") Long memberId,
                           @Param("status") FineStatus status,
                           @Param("search") String search,
                           Pageable pageable);
}
