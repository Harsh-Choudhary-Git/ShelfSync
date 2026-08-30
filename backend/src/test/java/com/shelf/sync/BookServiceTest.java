package com.shelf.sync;

import com.shelf.sync.dto.BookRequest;
import com.shelf.sync.dto.BookResponse;
import com.shelf.sync.entity.Author;
import com.shelf.sync.entity.Book;
import com.shelf.sync.entity.Category;
import com.shelf.sync.entity.Publisher;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.repository.AuthorRepository;
import com.shelf.sync.repository.BookRepository;
import com.shelf.sync.repository.CategoryRepository;
import com.shelf.sync.repository.PublisherRepository;
import com.shelf.sync.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private PublisherRepository publisherRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private BookService bookService;

    private Author author;
    private Publisher publisher;
    private Category category;
    private Book book;

    @BeforeEach
    void setUp() {
        author = new Author("Martin Fowler", "Bio", "British", 1963);
        author.setId(1L);

        publisher = new Publisher("Addison-Wesley", "Boston", "http://aw.com", "info@aw.com", "123");
        publisher.setId(1L);

        category = new Category("Computer Science", "CS Books");
        category.setId(1L);

        book = new Book("978-0132350884", "Clean Code", "Hand book", author, publisher, category, 2008, 5, 5, "Shelf A-1", null);
        book.setId(1L);
    }

    @Test
    void testCreateBook_Success() {
        BookRequest request = new BookRequest();
        request.setIsbn("978-0132350884");
        request.setTitle("Clean Code");
        request.setAuthorId(1L);
        request.setCategoryId(1L);
        request.setPublisherId(1L);
        request.setTotalCopies(5);
        request.setAvailableCopies(5);

        when(bookRepository.existsByIsbn("978-0132350884")).thenReturn(false);
        when(authorRepository.findById(1L)).thenReturn(Optional.of(author));
        when(publisherRepository.findById(1L)).thenReturn(Optional.of(publisher));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        BookResponse response = bookService.createBook(request);

        assertNotNull(response);
        assertEquals("Clean Code", response.getTitle());
        assertEquals("978-0132350884", response.getIsbn());
        verify(bookRepository, times(1)).save(any(Book.class));
    }

    @Test
    void testCreateBook_DuplicateIsbn_ThrowsConflict() {
        BookRequest request = new BookRequest();
        request.setIsbn("978-0132350884");
        request.setTitle("Clean Code");

        when(bookRepository.existsByIsbn("978-0132350884")).thenReturn(true);

        assertThrows(ConflictException.class, () -> bookService.createBook(request));
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void testCreateBook_AvailableCopiesExceedsTotal_ThrowsBadRequest() {
        BookRequest request = new BookRequest();
        request.setIsbn("978-0132350884");
        request.setTitle("Clean Code");
        request.setTotalCopies(3);
        request.setAvailableCopies(5);

        when(bookRepository.existsByIsbn("978-0132350884")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> bookService.createBook(request));
    }
}
