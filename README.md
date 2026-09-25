# 🌾 KrishiAI - AI Powered Agriculture Platform

A production-ready **Full Stack AI-Powered Agriculture Application** designed to provide intelligent agricultural assistance by combining **Artificial Intelligence, Machine Learning, modern web technologies, and REST APIs**.

KrishiAI integrates a dedicated **AI Services layer**, a **Spring Boot backend**, and a modern **React.js frontend** to create a scalable platform for agriculture-related assistance and intelligent decision-making.

This project demonstrates strong understanding of:

- Full Stack Application Development
- Artificial Intelligence & Machine Learning Integration
- REST API Design & Integration
- Spring Boot Backend Development
- React.js Frontend Development
- Database Management
- Secure Backend Architecture
- AI Service Integration
- Responsive UI Development
- Modular Software Architecture
- API-Based Communication
- Production-Oriented Application Development

---

# 🏗️ System Architecture

```text
                    React.js Frontend
                           ↓
                       REST APIs
                           ↓
                    Spring Boot Backend
                       ↓          ↓
                       ↓          ↓
                MySQL Database   AI Services
                                    ↓
                              AI / ML Processing
                                    ↓
                              Intelligent Results
```

---

# 🚀 Tech Stack

## 🔵 Backend

- Java
- Spring Boot
- Spring Security
- REST APIs
- Spring Data JPA
- Hibernate
- Maven
- JWT Authentication

## 🟢 Frontend

- React.js
- JavaScript
- Vite
- Axios
- React Router DOM
- Context API
- Tailwind CSS
- Responsive UI
- REST API Integration

## 🤖 AI Services

- Python
- Artificial Intelligence
- Machine Learning
- AI/ML Model Integration
- Python-based AI Services
- API-based AI Communication

## 🗄️ Database

- MySQL
- MySQL Workbench
- JPA / Hibernate

## 🧰 Tools

- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git
- GitHub
- Maven
- npm

---

# 📂 Project Structure

```text
KrishiAI/
│
├── AI Services/
│   ├── ...
│   ├── ...
│   └── ...
│
├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   ├── Dockerfile
│   └── ...
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🤖 AI Services Architecture

The `AI Services` module contains the AI/ML-related functionality of KrishiAI.

It is designed as an independent service layer so that AI processing can be developed and maintained separately from the main backend application.

### Responsibilities

- AI/ML model processing
- Agricultural data processing
- Intelligent recommendation generation
- AI-based analysis
- Communication with the Spring Boot backend
- Returning processed results through APIs

### Architecture

```text
Backend
   │
   │ AI Request
   ▼
AI Services
   │
   ▼
AI / ML Model
   │
   ▼
Data Processing
   │
   ▼
AI Response
   │
   ▼
Backend
```

This service-based architecture makes it easier to replace, improve, or scale AI models independently.

---

# 🔵 Backend Architecture

The `Backend` module is responsible for handling the core application logic and communication between the frontend, database, and AI services.

### Backend Responsibilities

- REST API development
- Request validation
- Business logic
- Database operations
- Authentication
- Authorization
- AI service communication
- Error handling
- Data processing

### Backend Architecture

```text
Controller
     ↓
Service
     ↓
Repository
     ↓
Database
```

The backend follows a **layered architecture** to improve maintainability, scalability, and separation of concerns.

---

# 🟢 Frontend Architecture

The `Frontend` module provides the user-facing interface of the KrishiAI application.

### Frontend Responsibilities

- User interaction
- Agricultural information display
- Communication with backend APIs
- Form handling
- Authentication state management
- Responsive UI
- Displaying AI-generated results

### Frontend Architecture

```text
Pages
  ↓
Components
  ↓
Context / Hooks
  ↓
Axios / API Layer
  ↓
Backend REST APIs
```

---

# 🔐 Key Features

## ✔ AI-Powered Agricultural Assistance

KrishiAI integrates Artificial Intelligence into the agricultural workflow to provide intelligent assistance based on the available agricultural information and user input.

## ✔ AI / ML Service Integration

- Dedicated AI service layer
- Independent AI processing
- Backend-to-AI communication
- API-based AI integration
- Modular AI architecture

## ✔ Full Stack Architecture

The application consists of three major layers:

```text
Frontend
    ↓
Backend
    ↓
AI Services
    ↓
Database
```

Each layer has a clearly defined responsibility.

## ✔ Secure Backend

The backend is designed to support secure communication between the frontend, application services, and database.

Security considerations include:

- Authentication
- Authorization
- Secure API access
- Input validation
- Environment-based configuration
- Protection of sensitive credentials

## ✔ REST API Integration

The application uses REST APIs for communication between different components.

```text
React Frontend
      ↓
HTTP Request
      ↓
Spring Boot API
      ↓
Business Logic
      ↓
Database / AI Services
      ↓
HTTP Response
      ↓
React Frontend
```

## ✔ Database Integration

MySQL is used for persistent data storage.

The backend uses:

- Spring Data JPA
- Hibernate
- Repository Pattern
- Entity Mapping
- Database Transactions

## ✔ Responsive User Interface

The frontend is designed to provide a responsive and user-friendly experience across different screen sizes.

---

# 🔄 Application Workflow

```text
                        User
                         │
                         ▼
                ┌─────────────────┐
                │    Frontend     │
                │    React.js     │
                └────────┬────────┘
                         │
                         │ REST API
                         ▼
                ┌─────────────────┐
                │     Backend     │
                │   Spring Boot   │
                └───────┬─┬───────┘
                        │ │
              Database │ │ AI Request
                        │ │
                        ▼ ▼
                  ┌───────┐ ┌──────────────┐
                  │ MySQL │ │ AI Services  │
                  └───────┘ └──────┬───────┘
                                    │
                                    ▼
                              AI / ML Model
                                    │
                                    ▼
                              AI Processing
                                    │
                                    ▼
                              AI Response
                                    │
                                    ▼
                                 Backend
                                    │
                                    ▼
                                Frontend
                                    │
                                    ▼
                                  User
```

---

# ⚙️ Setup Instructions

## 📋 Prerequisites

Make sure the following software is installed:

- Java 17+
- Python 3.10+
- Node.js
- npm
- Maven
- MySQL
- Git

Check the installed versions:

```bash
java --version
python --version
node --version
npm --version
mvn --version
git --version
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/Sambhav-2310/KrishiAI.git
```

Navigate into the project:

```bash
cd KrishiAI
```

---

# 🤖 AI Services Setup

Navigate to the AI Services directory:

```bash
cd "AI Services"
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables and API keys.

Start the AI service using the appropriate Python entry point configured in the project.

> **Note:** `.venv/` is intentionally excluded from GitHub and should be created locally after cloning the repository.

---

# 🔧 Backend Setup

Navigate to the backend:

```bash
cd Backend
```

Configure the database connection and required environment variables.

Build the application:

```bash
mvn clean install
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will start on the configured application port.

---

# 💻 Frontend Setup

Navigate to the frontend:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the URL displayed in the terminal.

---

# 🗄️ Database Configuration

KrishiAI uses MySQL for persistent data storage.

Create a database:

```sql
CREATE DATABASE krishiai;
```

Configure the database connection according to the backend configuration.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/krishiai
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> Use your own local database credentials and never commit passwords to GitHub.

---

# 🔐 Environment Variables

Sensitive configuration should be stored using environment variables.

Example:

```env
DATABASE_URL=your_database_url
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

JWT_SECRET=your_secret_key

AI_SERVICE_URL=http://localhost:5000

API_KEY=your_api_key
```

Depending on the services used by the project, additional environment variables may be required.

### ⚠️ Security

Never commit:

```text
.env
API Keys
Passwords
Database Credentials
JWT Secrets
Private Tokens
Cloud Credentials
```

The `.gitignore` file is configured to prevent sensitive files and local development files from being uploaded.

---

# 🔌 API Communication

KrishiAI uses REST APIs for communication between the frontend and backend.

The backend also communicates with the AI service when an AI-powered operation is required.

```text
Frontend
   │
   │ HTTP Request
   ▼
Backend API
   │
   ├──────────────► MySQL
   │
   └──────────────► AI Services
                         │
                         ▼
                      AI Model
                         │
                         ▼
                     AI Result
                         │
                         ▼
                      Backend
                         │
                         ▼
                     Frontend
```

---

# 🧪 Testing

The project can be tested using multiple tools and approaches.

### Backend

```bash
mvn test
```

### API Testing

Use:

- Postman
- Browser Developer Tools
- Network Inspector

### Frontend

Test:

- UI components
- API integration
- Form validation
- Authentication flows
- Responsive layouts

### AI Services

AI endpoints and model functionality can be tested independently using the configured Python environment and API testing tools.

---

# 🐳 Docker Support

The backend can be containerized using Docker.

Build the Docker image:

```bash
docker build -t krishiai-backend .
```

Run the container:

```bash
docker run -p 8080:8080 krishiai-backend
```

Docker can be used to simplify deployment and provide a consistent runtime environment.

---

# ☁️ Deployment

The application is designed with deployment and scalability in mind.

Possible deployment architecture:

```text
                    Internet
                       │
                       ▼
                React Frontend
                       │
                       ▼
                Spring Boot API
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          MySQL             AI Services
```

The individual components can be deployed independently depending on infrastructure requirements.

---

# 📊 Scalability

The modular architecture allows individual components to scale independently.

### Frontend

Can be deployed through modern static hosting platforms.

### Backend

Can be containerized and deployed using cloud infrastructure.

### AI Services

Can be deployed independently and scaled according to AI processing requirements.

### Database

Can be migrated from local MySQL to managed cloud database infrastructure.

---

# 🔒 Security Considerations

The application should follow secure development practices including:

- Authentication and authorization
- Secure password storage
- JWT-based authentication
- Input validation
- API access control
- Environment-based secret management
- Secure database credentials
- Protection against unauthorized access
- HTTPS in production
- Avoiding sensitive information in source control

---

# 📈 Future Enhancements

KrishiAI can be extended with additional AI-powered agricultural capabilities.

### 🌱 Crop Recommendation

Provide crop recommendations based on agricultural and environmental parameters.

### 🦠 Crop Disease Detection

Use computer vision and machine learning to identify crop diseases from plant images.

### 🌦️ Weather Integration

Integrate real-time weather information to provide weather-aware agricultural recommendations.

### 🌾 Soil Analysis

Use soil parameters to generate agricultural recommendations.

### 💰 Market Price Prediction

Use historical agricultural market data to provide price-related insights.

### 🗺️ Location-Based Recommendations

Provide recommendations based on the user's geographical location.

### 🌐 Multi-Language Support

Add regional language support to make the application accessible to a wider audience.

### 📱 Mobile Application

Extend the platform with Android/iOS applications.

### 📊 Advanced Agricultural Analytics

Introduce dashboards and analytics for agricultural trends and insights.

---

# 🎯 Project Objectives

The major objectives of KrishiAI are:

- Integrate Artificial Intelligence with agriculture.
- Develop a practical AI-powered agricultural platform.
- Build a scalable full-stack architecture.
- Separate frontend, backend, and AI responsibilities.
- Provide a foundation for future AI/ML agricultural solutions.
- Apply modern software engineering principles to a real-world problem.
- Explore practical applications of AI and machine learning in agriculture.

---

# 💡 Why KrishiAI?

KrishiAI combines multiple areas of modern software development into a single application:

```text
             ┌──────────────────────┐
             │   Artificial         │
             │   Intelligence       │
             └──────────┬───────────┘
                        │
                        ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   React.js  │──►│ Spring Boot │──►│    MySQL    │
│  Frontend   │   │   Backend   │   │  Database   │
└─────────────┘   └──────┬──────┘   └─────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ AI Services  │
                  │  Python/ML   │
                  └──────────────┘
```

This architecture provides a strong foundation for building intelligent agricultural applications while maintaining clear separation between different system components.

---

# 🧑‍💻 Developer

**Sambhav Gupta**

Bachelor of Engineering  
Information Science and Engineering  
The National Institute of Engineering, Mysore

### Technical Interests

- Full Stack Development
- Java & Spring Boot
- React.js
- Artificial Intelligence
- Machine Learning
- Data Analytics
- Cloud Technologies
- Software Architecture

GitHub:  
https://github.com/Sambhav-2310

---

# 🤝 Contributing

Contributions and suggestions are welcome.

To contribute:

```bash
git clone https://github.com/Sambhav-2310/KrishiAI.git
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes and test them.

Commit your changes:

```bash
git add .
git commit -m "Add your feature"
```

Push your branch:

```bash
git push origin feature/your-feature
```

Then create a Pull Request.

---

# 📄 License

This project is currently developed for educational and academic purposes.

A formal open-source license can be added if the project is intended for public distribution.

---

# ⭐ Support

If you find **KrishiAI** useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 🌾 KrishiAI

### **Empowering Agriculture with Artificial Intelligence. 🤖🌱**
