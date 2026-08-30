package com.shelf.sync.repository;

import com.shelf.sync.entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

    List<Author> findByNameContainingIgnoreCase(String name);

    @Query("SELECT a FROM Author a WHERE " +
           "(:search IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.nationality) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Author> searchAuthors(@Param("search") String search, Pageable pageable);
}
