package com.shelf.sync.service;

import com.shelf.sync.dto.BookRequest;
import com.shelf.sync.dto.BookResponse;
import com.shelf.sync.entity.Author;
import com.shelf.sync.entity.Book;
import com.shelf.sync.entity.Category;
import com.shelf.sync.entity.LoanStatus;
import com.shelf.sync.entity.Publisher;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.AuthorRepository;
import com.shelf.sync.repository.BookRepository;
import com.shelf.sync.repository.CategoryRepository;
import com.shelf.sync.repository.LoanRepository;
import com.shelf.sync.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private PublisherRepository publisherRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Transactional(readOnly = true)
    public Page<BookResponse> getAllBooks(String search, Long categoryId, Long authorId, Boolean onlyAvailable,
                                          Integer minYear, Integer maxYear, Pageable pageable) {
        return bookRepository.searchBooks(search, categoryId, authorId, onlyAvailable, minYear, maxYear, pageable)
                .map(BookResponse::new);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return new BookResponse(book);
    }

    @Transactional(readOnly = true)
    public Book getBookEntityById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public BookResponse getBookByIsbn(String isbn) {
        Book book = bookRepository.findByIsbn(isbn.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ISBN: " + isbn));
        return new BookResponse(book);
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        String isbn = request.getIsbn().trim();
        if (bookRepository.existsByIsbn(isbn)) {
            throw new ConflictException("A book with ISBN '" + isbn + "' already exists");
        }

        if (request.getTotalCopies() < 0) {
            throw new BadRequestException("Total copies cannot be negative");
        }

        int availableCopies = request.getAvailableCopies() != null ? request.getAvailableCopies() : request.getTotalCopies();
        if (availableCopies > request.getTotalCopies()) {
            throw new BadRequestException("Available copies (" + availableCopies + ") cannot exceed total copies (" + request.getTotalCopies() + ")");
        }
        if (availableCopies < 0) {
            throw new BadRequestException("Available copies cannot be negative");
        }

        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + request.getAuthorId()));

        Publisher publisher = null;
        if (request.getPublisherId() != null) {
            publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Publisher not found with id: " + request.getPublisherId()));
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Book book = new Book();
        book.setIsbn(isbn);
        book.setTitle(request.getTitle().trim());
        book.setDescription(request.getDescription());
        book.setAuthor(author);
        book.setPublisher(publisher);
        book.setCategory(category);
        book.setPublicationYear(request.getPublicationYear());
        book.setEdition(request.getEdition());
        book.setLanguage(request.getLanguage() != null ? request.getLanguage() : "English");
        book.setPages(request.getPages());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(availableCopies);
        book.setLocationShelf(request.getLocationShelf());

        Book saved = bookRepository.save(book);
        return new BookResponse(saved);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        String newIsbn = request.getIsbn().trim();
        if (!book.getIsbn().equalsIgnoreCase(newIsbn) && bookRepository.existsByIsbn(newIsbn)) {
            throw new ConflictException("A book with ISBN '" + newIsbn + "' already exists");
        }

        if (request.getTotalCopies() < 0) {
            throw new BadRequestException("Total copies cannot be negative");
        }

        // Calculate copy delta to preserve current loan tracking
        int currentlyBorrowed = book.getTotalCopies() - book.getAvailableCopies();
        int newTotal = request.getTotalCopies();

        int newAvailable;
        if (request.getAvailableCopies() != null) {
            newAvailable = request.getAvailableCopies();
        } else {
            newAvailable = Math.max(0, newTotal - currentlyBorrowed);
        }

        if (newAvailable > newTotal) {
            throw new BadRequestException("Available copies (" + newAvailable + ") cannot exceed total copies (" + newTotal + ")");
        }
        if (newAvailable < 0) {
            throw new BadRequestException("Available copies cannot be negative");
        }

        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + request.getAuthorId()));

        Publisher publisher = null;
        if (request.getPublisherId() != null) {
            publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Publisher not found with id: " + request.getPublisherId()));
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        book.setIsbn(newIsbn);
        book.setTitle(request.getTitle().trim());
        book.setDescription(request.getDescription());
        book.setAuthor(author);
        book.setPublisher(publisher);
        book.setCategory(category);
        book.setPublicationYear(request.getPublicationYear());
        book.setEdition(request.getEdition());
        book.setLanguage(request.getLanguage() != null ? request.getLanguage() : "English");
        book.setPages(request.getPages());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);
        book.setLocationShelf(request.getLocationShelf());

        Book updated = bookRepository.save(book);
        return new BookResponse(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Check if there are active loans
        long activeLoans = loanRepository.countByStatus(LoanStatus.ACTIVE);
        // Specifically check if this book is in active loan
        boolean hasActiveLoans = loanRepository.findAll().stream()
                .anyMatch(l -> l.getBook().getId().equals(id) && l.getStatus() == LoanStatus.ACTIVE);

        if (hasActiveLoans) {
            throw new BadRequestException("Cannot delete book while there are active loans for it");
        }

        bookRepository.delete(book);
    }
}
