# AI-Powered Portfolio — Java Spring Boot + MySQL + NVIDIA AI

A complete, fully animated portfolio website built with:
- **Backend**: Java 17 + Spring Boot 3.2 + Spring Security + JWT
- **Database**: MySQL 8+
- **AI**: NVIDIA NIM (Llama 3.1) for the AI chatbot and portfolio analyzer
- **Frontend**: Pure HTML5, CSS3, JavaScript (no framework needed)

---

## Features

- **All Portfolio Sections**: Hero, About, Skills, Projects, Education, Experience, Certifications, Contact, Footer
- **Login & Register**: JWT-based authentication with BCrypt password hashing
- **AI Chatbot**: Powered by NVIDIA AI — answers questions about your portfolio
- **AI Portfolio Analyzer**: Scores and suggests improvements for each section
- **Dark / Light Mode**: Saved to localStorage
- **Smooth Animations**: Scroll reveals, typing effect, counter animations, parallax
- **Responsive**: Works on mobile, tablet, and desktop
- **Contact Form**: Saves messages to MySQL database
- **Project Filter**: Filter projects by category (Web, API, ML)

---

## Quick Start

### 1. Install Prerequisites

- Java 17+ ([Download](https://adoptium.net/))
- Maven 3.6+ (included in most IDEs, or `sudo apt install maven`)
- MySQL 8+ ([Download](https://dev.mysql.com/downloads/))

### 2. Setup MySQL Database

```bash
# Open MySQL CLI
mysql -u root -p

# Run the database script
source database.sql;
```

Or just create the database — Hibernate will create all tables automatically:

```sql
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Get Your NVIDIA API Key

1. Go to [https://build.nvidia.com/](https://build.nvidia.com/)
2. Sign up / Login
3. Go to API Keys → Generate Key
4. Copy the key

### 4. Configure application.properties

Open `src/main/resources/application.properties` and update:

```properties
# MySQL credentials
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# NVIDIA AI Key
nvidia.api.key=nvapi-XXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: change JWT secret
jwt.secret=myVeryLongAndSecretKeyForJWTTokens2024!
```

### 5. Add Your Information

Edit `src/main/resources/static/index.html` and replace:
- `Your Name Here` → Your actual name
- `Your City, Country` → Your location
- `your.email@example.com` → Your email
- All placeholder project descriptions → Your real projects
- Education timeline → Your actual education
- Experience timeline → Your actual experience
- Certifications → Your actual certifications
- Social media links → Your real profiles

Also update in `main.js`:
- `words` array in the typing effect → Your job titles
- Contact information

### 6. Build and Run

```bash
# Navigate to project root
cd portfolio-springboot

# Build and run
./mvnw spring-boot:run

# Or on Windows:
mvnw.cmd spring-boot:run

# Or build JAR first:
./mvnw package -DskipTests
java -jar target/portfolio-1.0.0.jar
```

### 7. Open in Browser

```
http://localhost:8080
```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes (JWT) |
| POST | `/api/auth/logout` | Logout | No |
| POST | `/api/contact` | Submit contact form | No |
| GET | `/api/contact/messages` | Get all messages | Yes (JWT) |
| POST | `/api/ai/chat` | AI chat (NVIDIA) | No |
| POST | `/api/ai/analyze` | AI analysis (NVIDIA) | No |
| GET | `/api/portfolio/stats` | Portfolio statistics | No |
| GET | `/api/healthz` | Health check | No |

---

## Project Structure

```
portfolio-springboot/
├── src/
│   └── main/
│       ├── java/com/portfolio/
│       │   ├── PortfolioApplication.java     # Main entry point
│       │   ├── config/
│       │   │   ├── SecurityConfig.java       # Spring Security + JWT
│       │   │   └── WebConfig.java            # CORS + static files
│       │   ├── controller/
│       │   │   ├── AuthController.java       # Login, Register, Me, Logout
│       │   │   ├── ContactController.java    # Contact form
│       │   │   ├── AiController.java         # NVIDIA AI chat + analyze
│       │   │   └── PortfolioController.java  # Stats
│       │   ├── model/
│       │   │   ├── User.java                 # User entity
│       │   │   └── ContactMessage.java       # Contact message entity
│       │   ├── repository/
│       │   │   ├── UserRepository.java       # JPA repository
│       │   │   └── ContactRepository.java    # JPA repository
│       │   ├── service/
│       │   │   ├── AuthService.java          # Auth business logic
│       │   │   ├── ContactService.java       # Contact business logic
│       │   │   ├── AiService.java            # NVIDIA AI integration
│       │   │   └── UserDetailsServiceImpl.java
│       │   ├── security/
│       │   │   ├── JwtUtil.java              # JWT token utility
│       │   │   └── JwtAuthFilter.java        # JWT filter
│       │   └── dto/
│       │       ├── LoginRequest.java
│       │       ├── RegisterRequest.java
│       │       ├── AuthResponse.java
│       │       ├── ContactRequest.java
│       │       ├── AiChatRequest.java
│       │       └── AiAnalyzeRequest.java
│       └── resources/
│           ├── application.properties        # Config (edit this!)
│           └── static/
│               ├── index.html                # Main page (edit this!)
│               ├── css/
│               │   └── style.css             # All styles
│               └── js/
│                   └── main.js               # All JavaScript
├── database.sql                              # MySQL setup script
├── pom.xml                                   # Maven dependencies
└── README.md                                 # This file
```

---

## Customization Guide

### Change Colors

Edit `style.css`, find the `:root` block:
```css
:root {
    --primary: #6c63ff;    /* Main purple color */
    --secondary: #00d4aa;  /* Teal accent */
    --accent: #ff6b6b;     /* Red accent */
    ...
}
```

### Change NVIDIA AI Model

In `application.properties`:
```properties
# Available NVIDIA models:
nvidia.model=meta/llama-3.1-70b-instruct     # Default (best quality)
nvidia.model=meta/llama-3.1-8b-instruct      # Faster, smaller
nvidia.model=mistralai/mixtral-8x7b-instruct-v0.1
nvidia.model=google/gemma-7b                 # Google Gemma
```

### Add More Projects

In `index.html`, copy a `.project-card` div and update:
- `data-category` attribute: `web`, `api`, or `ml`
- Tech tags
- Title and description
- GitHub and live demo links

### Deploy to Production

```bash
# Build production JAR
./mvnw package -DskipTests

# Run with production settings
java -jar target/portfolio-1.0.0.jar \
  --spring.datasource.password=YOUR_DB_PASS \
  --nvidia.api.key=YOUR_NVIDIA_KEY \
  --server.port=8080
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Java 17 | Programming Language |
| Spring Boot 3.2 | Backend Framework |
| Spring Security | Authentication & Authorization |
| Spring Data JPA | Database ORM |
| MySQL 8 | Relational Database |
| Hibernate | ORM Implementation |
| JWT (jjwt) | Token-based Auth |
| BCrypt | Password Hashing |
| NVIDIA NIM API | AI Chatbot & Analysis |
| WebFlux (WebClient) | HTTP Client for AI API |
| Lombok | Boilerplate Reduction |
| HTML5 | Frontend Structure |
| CSS3 | Styling & Animations |
| JavaScript (ES6+) | Frontend Logic |

---

## License

MIT License — Free to use and modify for your personal portfolio.

---

*Built with Java Spring Boot + NVIDIA AI. Replace placeholder content with your own information.*
