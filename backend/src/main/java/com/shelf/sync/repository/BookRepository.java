package com.shelf.sync.repository;

import com.shelf.sync.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    Boolean existsByIsbn(String isbn);

    long countByAvailableCopiesGreaterThan(int count);

    @Query("SELECT COALESCE(SUM(b.totalCopies), 0) FROM Book b")
    long sumTotalCopies();

    @Query("SELECT COALESCE(SUM(b.availableCopies), 0) FROM Book b")
    long sumAvailableCopies();

    @Query("SELECT b FROM Book b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.publisher " +
           "LEFT JOIN FETCH b.category " +
           "WHERE (:search IS NULL OR " +
           "       LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(b.author.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(b.category.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       (b.publisher IS NOT NULL AND LOWER(b.publisher.name) LIKE LOWER(CONCAT('%', :search, '%')))) " +
           "  AND (:categoryId IS NULL OR b.category.id = :categoryId) " +
           "  AND (:authorId IS NULL OR b.author.id = :authorId) " +
           "  AND (:onlyAvailable IS NULL OR :onlyAvailable = false OR b.availableCopies > 0) " +
           "  AND (:minYear IS NULL OR b.publicationYear >= :minYear) " +
           "  AND (:maxYear IS NULL OR b.publicationYear <= :maxYear)")
    Page<Book> searchBooks(@Param("search") String search,
                           @Param("categoryId") Long categoryId,
                           @Param("authorId") Long authorId,
                           @Param("onlyAvailable") Boolean onlyAvailable,
                           @Param("minYear") Integer minYear,
                           @Param("maxYear") Integer maxYear,
                           Pageable pageable);
}
