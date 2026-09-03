package com.shelf.sync.service;

import com.shelf.sync.entity.*;
import com.shelf.sync.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataInitializerService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializerService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private PublisherRepository publisherRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private SettingService settingService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        settingService.initializeDefaultSettings();

        // 1. Ensure core users exist and have updated passwords and active status
        User admin = seedOrUpdateUser("admin", "admin@shelfsync.io", "Admin@123", "Alexander", "Pierce", "+1 555-0100", Role.ROLE_ADMIN);
        User lib1 = seedOrUpdateUser("librarian1", "sarah.connor@shelfsync.io", "Lib@123", "Sarah", "Connor", "+1 555-0101", Role.ROLE_LIBRARIAN);
        User lib2 = seedOrUpdateUser("librarian2", "david.kim@shelfsync.io", "Lib@123", "David", "Kim", "+1 555-0102", Role.ROLE_LIBRARIAN);
        User mem1 = seedOrUpdateUser("member1", "alice.johnson@example.com", "Mem@123", "Alice", "Johnson", "+1 555-0201", Role.ROLE_MEMBER);
        User mem2 = seedOrUpdateUser("member2", "brian.miller@example.com", "Mem@123", "Brian", "Miller", "+1 555-0202", Role.ROLE_MEMBER);
        User mem3 = seedOrUpdateUser("member3", "clara.oswald@example.com", "Mem@123", "Clara", "Oswald", "+1 555-0203", Role.ROLE_MEMBER);
        User mem4 = seedOrUpdateUser("member4", "daniel.craig@example.com", "Mem@123", "Daniel", "Craig", "+1 555-0204", Role.ROLE_MEMBER);
        User mem5 = seedOrUpdateUser("member5", "elena.rostova@example.com", "Mem@123", "Elena", "Rostova", "+1 555-0205", Role.ROLE_MEMBER);

        if (categoryRepository.count() > 0) {
            logger.info("Library catalog already seeded. Skipping catalog initialization.");
            return;
        }

        logger.info("Seeding initial catalog data for ShelfSync...");

        // 2. Create Categories
        Category catCS = categoryRepository.save(new Category("Computer Science", "Software engineering, algorithms, architectures, and programming languages"));
        Category catMath = categoryRepository.save(new Category("Mathematics", "Calculus, linear algebra, discrete mathematics, and probability"));
        Category catPhys = categoryRepository.save(new Category("Physics", "Quantum mechanics, astrophysics, thermodynamics, and relativity"));
        Category catLit = categoryRepository.save(new Category("Literature", "Classic fiction, modern prose, essays, and poetry"));
        Category catHist = categoryRepository.save(new Category("History", "World history, ancient civilizations, and political science"));
        Category catEng = categoryRepository.save(new Category("Engineering", "Electrical, mechanical, robotics, and systems engineering"));
        Category catPhil = categoryRepository.save(new Category("Philosophy", "Ethics, metaphysics, logic, and epistemology"));
        Category catBio = categoryRepository.save(new Category("Biology", "Genetics, evolutionary biology, and neuroscience"));

        // 3. Create Authors
        Author authMartin = authorRepository.save(new Author("Robert C. Martin", "Software craftsman, author of Clean Code and Clean Architecture.", "American", 1952));
        Author authFowler = authorRepository.save(new Author("Martin Fowler", "Chief Scientist at ThoughtWorks, author on software architecture and refactoring.", "British", 1963));
        Author authKnuth = authorRepository.save(new Author("Donald E. Knuth", "Computer scientist and mathematician, author of The Art of Computer Programming.", "American", 1938));
        Author authSagan = authorRepository.save(new Author("Carl Sagan", "Astronomer, planetary scientist, cosmologist, author of Cosmos.", "American", 1934));
        Author authOrwell = authorRepository.save(new Author("George Orwell", "English novelist, essayist, journalist, author of 1984 and Animal Farm.", "British", 1903));
        Author authFeynman = authorRepository.save(new Author("Richard P. Feynman", "Theoretical physicist and Nobel laureate, known for Feynman Lectures.", "American", 1918));
        Author authEvans = authorRepository.save(new Author("Eric Evans", "Thought leader in software design and author of Domain-Driven Design.", "American", 1965));
        Author authBloch = authorRepository.save(new Author("Joshua Bloch", "Software engineer and author of Effective Java, former Chief Java Architect at Google.", "American", 1961));
        Author authHarari = authorRepository.save(new Author("Yuval Noah Harari", "Historian, philosopher, and bestselling author of Sapiens.", "Israeli", 1976));

        // 4. Create Publishers
        Publisher pubOReilly = publisherRepository.save(new Publisher("O'Reilly Media", "1005 Gravenstein Highway North, Sebastopol, CA", "https://oreilly.com", "contact@oreilly.com", "+1 707-827-7000"));
        Publisher pubAddison = publisherRepository.save(new Publisher("Addison-Wesley", "501 Boylston St, Boston, MA", "https://informit.com", "info@addisonwesley.com", "+1 617-848-6000"));
        Publisher pubMit = publisherRepository.save(new Publisher("MIT Press", "1 Rogers Street, Cambridge, MA", "https://mitpress.mit.edu", "mitpress-orders@mit.edu", "+1 617-253-5646"));
        Publisher pubPenguin = publisherRepository.save(new Publisher("Penguin Books", "1745 Broadway, New York, NY", "https://penguin.com", "customercare@penguinrandomhouse.com", "+1 212-782-9000"));
        Publisher pubPearson = publisherRepository.save(new Publisher("Pearson Education", "80 Strand, London, UK", "https://pearson.com", "support@pearson.com", "+44 20-7010-2000"));
        Publisher pubHarper = publisherRepository.save(new Publisher("HarperCollins", "195 Broadway, New York, NY", "https://harpercollins.com", "orders@harpercollins.com", "+1 212-207-7000"));

        // 5. Create Books (22+ books)
        List<Book> books = new ArrayList<>();
        books.add(new Book("978-0132350884", "Clean Code: A Handbook of Agile Software Craftsmanship",
                "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
                authMartin, pubPearson, catCS, 2008, 5, 4, "Shelf A-12", "https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0201485677", "Refactoring: Improving the Design of Existing Code",
                "Refactoring is a controlled technique for improving the design of an existing code base.",
                authFowler, pubAddison, catCS, 2018, 4, 3, "Shelf A-13", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0134685991", "Effective Java (3rd Edition)",
                "The definitive guide to best practices in the Java programming language by Joshua Bloch.",
                authBloch, pubAddison, catCS, 2017, 6, 5, "Shelf A-14", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0321125217", "Domain-Driven Design: Tackling Complexity in the Heart of Software",
                "Explores how to structure software around deep domain models to master complex logic.",
                authEvans, pubAddison, catCS, 2003, 3, 2, "Shelf A-15", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0201896831", "The Art of Computer Programming, Vol 1: Fundamental Algorithms",
                "The bible of computer science algorithms and fundamental mathematical techniques.",
                authKnuth, pubAddison, catCS, 1997, 2, 0, "Shelf A-16", "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0134494166", "Clean Architecture: A Craftsman's Guide to Software Structure",
                "Practical rules and boundaries for designing universal, decoupled software architectures.",
                authMartin, pubPearson, catCS, 2017, 5, 3, "Shelf A-17", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0345539434", "Cosmos",
                "Carl Sagan's iconic exploration of the universe, science, and the human journey.",
                authSagan, pubPenguin, catPhys, 1980, 4, 3, "Shelf P-01", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0465023820", "The Feynman Lectures on Physics, Vol 1",
                "The legendary lectures by Richard Feynman covering mechanics, radiation, and heat.",
                authFeynman, pubPearson, catPhys, 1963, 3, 2, "Shelf P-02", "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0451524935", "1984",
                "The chilling dystopian masterpiece about surveillance, totalitarianism, and the erasure of truth.",
                authOrwell, pubPenguin, catLit, 1949, 8, 6, "Shelf L-01", "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0451526342", "Animal Farm",
                "A brilliant political fable satirizing totalitarian power and corruption.",
                authOrwell, pubPenguin, catLit, 1945, 6, 5, "Shelf L-02", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0062316097", "Sapiens: A Brief History of Humankind",
                "A groundbreaking narrative exploring how Homo sapiens conquered the globe through shared myths.",
                authHarari, pubHarper, catHist, 2014, 5, 4, "Shelf H-01", "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0262033848", "Introduction to Algorithms (4th Edition)",
                "Comprehensive textbook covering the modern study of computer algorithms.",
                authKnuth, pubMit, catCS, 2022, 4, 3, "Shelf A-18", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-1449373320", "Designing Data-Intensive Applications",
                "The definitive guide to the architecture of scalable, reliable, and maintainable systems by Martin Kleppmann.",
                authFowler, pubOReilly, catCS, 2017, 7, 5, "Shelf A-19", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0393081541", "Surely You're Joking, Mr. Feynman!",
                "Adventures of a curious character, Nobel prize physicist Richard Feynman.",
                authFeynman, pubPenguin, catLit, 1985, 3, 2, "Shelf L-03", "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0262510875", "Structure and Interpretation of Computer Programs (SICP)",
                "Iconic computer science foundational text exploring abstraction and computational processes.",
                authKnuth, pubMit, catCS, 1996, 3, 1, "Shelf A-20", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0131103627", "The C Programming Language (2nd Edition)",
                "The classic authoritative guide to C by Brian Kernighan and Dennis Ritchie.",
                authBloch, pubPearson, catCS, 1988, 4, 4, "Shelf A-21", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0385537377", "Homo Deus: A Brief History of Tomorrow",
                "Yuval Noah Harari examines future challenges as humankind seeks godlike powers.",
                authHarari, pubHarper, catHist, 2016, 4, 3, "Shelf H-02", "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0345409460", "The Demon-Haunted World: Science as a Candle in the Dark",
                "Carl Sagan's passionate manifesto on critical thinking and scientific inquiry.",
                authSagan, pubPenguin, catPhil, 1995, 3, 2, "Shelf PH-01", "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0135957059", "The Pragmatic Programmer: 20th Anniversary Edition",
                "Journey to mastery for modern software developers.",
                authMartin, pubAddison, catCS, 2019, 5, 4, "Shelf A-22", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0521679718", "Linear Algebra and Its Applications",
                "Authoritative text on vector spaces, matrix operations, and eigenvalues.",
                authKnuth, pubPearson, catMath, 2015, 3, 3, "Shelf M-01", "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0073383095", "Fundamentals of Electric Circuits",
                "Standard engineering reference on circuit analysis and AC/DC steady-state signals.",
                authEvans, pubMit, catEng, 2016, 2, 2, "Shelf E-01", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60"));

        books.add(new Book("978-0393347777", "The Selfish Gene (40th Anniversary)",
                "Richard Dawkins' revolutionary perspective on evolution, gene selection, and altruism.",
                authSagan, pubPenguin, catBio, 2016, 4, 3, "Shelf B-01", "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=60"));

        bookRepository.saveAll(books);

        // 6. Create Demo Loans
        // Active Loan 1: Alice has Clean Code (Due in 10 days)
        Loan loan1 = new Loan(mem1, books.get(0), lib1, LocalDate.now().minusDays(4), LocalDate.now().plusDays(10));
        loan1.setStatus(LoanStatus.ACTIVE);
        loanRepository.save(loan1);

        // Active Loan 2: Brian has Refactoring (Due in 5 days)
        Loan loan2 = new Loan(mem2, books.get(1), lib1, LocalDate.now().minusDays(9), LocalDate.now().plusDays(5));
        loan2.setStatus(LoanStatus.ACTIVE);
        loanRepository.save(loan2);

        // Overdue Loan 3: Clara has 1984 (Issued 20 days ago, was due 6 days ago -> OVERDUE)
        Loan loan3 = new Loan(mem3, books.get(8), lib2, LocalDate.now().minusDays(20), LocalDate.now().minusDays(6));
        loan3.setStatus(LoanStatus.OVERDUE);
        loanRepository.save(loan3);

        // Returned Loan 4: Daniel borrowed Cosmos and returned it on time
        Loan loan4 = new Loan(mem4, books.get(6), lib1, LocalDate.now().minusDays(30), LocalDate.now().minusDays(16));
        loan4.setReturnDate(LocalDate.now().minusDays(18));
        loan4.setStatus(LoanStatus.RETURNED);
        loanRepository.save(loan4);

        // Returned Late Loan 5: Alice returned Clean Architecture 3 days late, fine generated
        Loan loan5 = new Loan(mem1, books.get(5), lib2, LocalDate.now().minusDays(25), LocalDate.now().minusDays(11));
        loan5.setReturnDate(LocalDate.now().minusDays(8));
        loan5.setStatus(LoanStatus.RETURNED);
        Loan savedLoan5 = loanRepository.save(loan5);

        // Fine for loan 5: 3 days * $1.50 = $4.50 (Unpaid)
        Fine fine1 = new Fine(mem1, savedLoan5, BigDecimal.valueOf(4.50), "Overdue return by 3 day(s) for book 'Clean Architecture'");
        fine1.setStatus(FineStatus.UNPAID);
        fineRepository.save(fine1);

        // Paid fine example for Brian
        Fine fine2 = new Fine(mem2, null, BigDecimal.valueOf(3.00), "Late return settlement for past loan");
        fine2.setStatus(FineStatus.PAID);
        fine2.setPaidAt(LocalDateTime.now().minusDays(5));
        fineRepository.save(fine2);

        // 7. Create Demo Reservations
        // TAOCP (books[4]) has 0 available copies -> Clara reserved it
        Reservation res1 = new Reservation(mem3, books.get(4), LocalDateTime.now().minusDays(2), LocalDateTime.now().plusDays(5));
        res1.setStatus(ReservationStatus.ACTIVE);
        reservationRepository.save(res1);

        // Elena also reserved TAOCP (queue pos 2)
        Reservation res2 = new Reservation(mem5, books.get(4), LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(6));
        res2.setStatus(ReservationStatus.ACTIVE);
        reservationRepository.save(res2);

        // Fulfilled reservation example
        Reservation res3 = new Reservation(mem1, books.get(0), LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(3));
        res3.setStatus(ReservationStatus.FULFILLED);
        reservationRepository.save(res3);

        logger.info("Demo data seeding completed successfully!");
    }

    private User seedOrUpdateUser(String username, String email, String plainPassword, String firstName, String lastName, String phone, Role role) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(User::new);

        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(plainPassword));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }
}
