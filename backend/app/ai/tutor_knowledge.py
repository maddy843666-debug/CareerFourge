from typing import List, Tuple, Optional
import re

TOPIC_KNOWLEDGE = {
    "java": (
        "Java is a high-performance, class-based, object-oriented programming language designed around the "
        "'Write Once, Run Anywhere' philosophy via the Java Virtual Machine (JVM). In modern software engineering, "
        "Java is the dominant language for high-throughput enterprise systems, distributed backends, and microservices "
        "(most notably with the Spring Boot framework). Core concepts to master include OOP principles (Polymorphism, "
        "Inheritance, Encapsulation, Abstraction), the Java Collections Framework (ArrayList, HashMap, ConcurrentHashMap), "
        "JVM internals (memory model, Garbage Collection tuning), multithreading/concurrency (Executors, CompletableFuture), "
        "and building RESTful microservices with Spring Boot and Spring Data JPA.",
        [
            "Master Java OOP, Collections & JVM memory model",
            "Build a Spring Boot REST API with PostgreSQL & JPA",
            "Practice Java multithreading and concurrency patterns"
        ]
    ),
    "spring": (
        "Spring and Spring Boot are the industry-standard framework ecosystem for enterprise Java backend development. "
        "Spring Boot eliminates configuration boilerplate through Dependency Injection (Inversion of Control), Auto-Configuration, "
        "and Spring Starters. For a software engineer, critical areas include Spring Web (building REST APIs), Spring Data JPA/Hibernate "
        "(database persistence and ORM), Spring Security (JWT authentication and role-based access control), and Spring Cloud "
        "for distributed microservices architecture (service discovery, API gateways, and distributed config).",
        [
            "Build REST controllers with Spring Boot & validation",
            "Configure Spring Data JPA entities, repositories & transactions",
            "Implement secure JWT authentication with Spring Security"
        ]
    ),
    "python": (
        "Python is a versatile, high-level language renowned for its expressive syntax, rapid development speed, and rich ecosystem. "
        "In software engineering, Python is a leading choice for backend development (FastAPI, Django), automation/scripting, "
        "and data/AI systems. Essential competencies include object-oriented design, list/dict comprehensions, decorators, generators, "
        "asynchronous programming (`asyncio` and `async/await`), type hinting with Pydantic, and building scalable API services.",
        [
            "Master Python async/await & asyncio event loops",
            "Build high-performance REST APIs with FastAPI & Pydantic",
            "Implement unit testing with Pytest and mock fixtures"
        ]
    ),
    "c++": (
        "C++ is a high-performance, statically-typed systems programming language providing direct hardware access, deterministic "
        "resource management, and zero-cost abstractions. It powers operating systems, game engines, high-frequency trading (HFT), "
        "embedded systems, and database engines. Key topics to master include pointers and references, RAII (Resource Acquisition Is "
        "Initialization), smart pointers (`unique_ptr`, `shared_ptr`), the Standard Template Library (STL algorithms and containers), "
        "move semantics, and modern C++ (C++17/C++20) features.",
        [
            "Master RAII, pointers, and memory management",
            "Practice Standard Template Library (STL) algorithms & containers",
            "Learn modern C++ move semantics and multithreading"
        ]
    ),
    "cpp": (
        "C++ is a high-performance, statically-typed systems programming language providing direct hardware access, deterministic "
        "resource management, and zero-cost abstractions. It powers operating systems, game engines, high-frequency trading (HFT), "
        "embedded systems, and database engines. Key topics to master include pointers and references, RAII (Resource Acquisition Is "
        "Initialization), smart pointers (`unique_ptr`, `shared_ptr`), the Standard Template Library (STL algorithms and containers), "
        "move semantics, and modern C++ (C++17/C++20) features.",
        [
            "Master RAII, pointers, and memory management",
            "Practice Standard Template Library (STL) algorithms & containers",
            "Learn modern C++ move semantics and multithreading"
        ]
    ),
    "go": (
        "Go (Golang) is an open-source systems language created by Google for clarity, fast compilation, and lightweight concurrency. "
        "With built-in primitives like goroutines and channels, Go is the standard language for cloud-native infrastructure "
        "(Docker, Kubernetes, Prometheus, Terraform) and high-concurrency microservices. Key focus areas include interfaces, "
        "struct embedding, error handling patterns, goroutine lifecycle management, and building REST/gRPC services.",
        [
            "Master Go structs, interfaces, and error handling",
            "Build concurrent pipelines using goroutines & channels",
            "Create high-throughput RESTful microservices with Go standard library"
        ]
    ),
    "golang": (
        "Go (Golang) is an open-source systems language created by Google for clarity, fast compilation, and lightweight concurrency. "
        "With built-in primitives like goroutines and channels, Go is the standard language for cloud-native infrastructure "
        "(Docker, Kubernetes, Prometheus, Terraform) and high-concurrency microservices. Key focus areas include interfaces, "
        "struct embedding, error handling patterns, goroutine lifecycle management, and building REST/gRPC services.",
        [
            "Master Go structs, interfaces, and error handling",
            "Build concurrent pipelines using goroutines & channels",
            "Create high-throughput RESTful microservices with Go standard library"
        ]
    ),
    "rust": (
        "Rust is a modern systems language providing C/C++ speed and control while mathematically guaranteeing memory safety and thread safety "
        "without a garbage collector. It achieves this via its borrow checker, ownership model, and lifetimes. Widely adopted for systems programming, "
        "networking tools, WebAssembly, and secure backend infrastructure. Focus on ownership and borrowing, pattern matching with Enums (`Result`/`Option`), "
        "traits, and the Cargo package ecosystem.",
        [
            "Master ownership, borrowing, and lifetimes",
            "Write safe idiomatic code with Result and Option types",
            "Build a fast CLI or async web service using Tokio and Axum"
        ]
    ),
    "c#": (
        "C# is a powerful, modern, object-oriented language developed by Microsoft for the cross-platform .NET runtime. "
        "It is widely used for building enterprise web APIs (ASP.NET Core), cloud microservices, desktop software, and games (Unity). "
        "Key concepts include LINQ (Language Integrated Query), async/await task asynchronous patterns, Entity Framework Core for ORM persistence, "
        "dependency injection, and microservices architecture.",
        [
            "Master C# OOP, generics, and LINQ queries",
            "Build enterprise REST APIs with ASP.NET Core",
            "Manage relational databases using Entity Framework Core"
        ]
    ),
    "system design": (
        "System Design is the art and engineering of architecting scalable, resilient, and maintainable software systems. "
        "Key components include Load Balancers (Nginx, HAProxy), Caching (Redis cache-aside, write-through), Database Architecture "
        "(SQL vs NoSQL, master-replica replication, sharding, ACID vs BASE), Asynchronous Message Queues (Kafka, RabbitMQ), "
        "CDNs, Microservices vs Monolith trade-offs, and CAP theorem trade-offs. Always practice estimating queries per second (QPS), "
        "latency budgets, and single points of failure (SPOF).",
        [
            "Study Scalability Fundamentals (Load Balancing, Caching, Sharding)",
            "Design an end-to-end system (e.g. TinyURL or Rate Limiter)",
            "Master CAP theorem, database indexing, and async message queues"
        ]
    ),
    "dsa": (
        "Data Structures and Algorithms (DSA) form the computational backbone of software engineering and coding interviews. "
        "Fundamental data structures include Arrays, Hash Maps, Linked Lists, Stacks, Queues, Binary Trees, Heaps, and Graphs. "
        "Core algorithmic paradigms include Two Pointers, Sliding Window, Binary Search, BFS/DFS graph traversals, and Dynamic Programming. "
        "Always evaluate and articulate both Time Complexity and Space Complexity using Big-O notation.",
        [
            "Master Arrays, Strings, and Hash Maps (Two Pointers & Sliding Window)",
            "Practice Trees and Graphs (BFS, DFS, Dijkstra)",
            "Solve 2-3 LeetCode Medium problems daily with Big-O analysis"
        ]
    ),
    "sql": (
        "SQL (Structured Query Language) is the foundation of relational data storage and querying in systems like PostgreSQL and MySQL. "
        "For software engineers, proficiency requires mastering complex multi-table JOINs, GROUP BY aggregations, subqueries, "
        "window functions (`ROW_NUMBER()`, `RANK()`), indexing strategies (B-Trees, Composite Indexes, EXPLAIN ANALYZE), "
        "transactions (ACID properties, isolation levels), and database normalization.",
        [
            "Master SELECT, multi-table JOINs, and window functions",
            "Learn indexing, query plans (EXPLAIN), and performance optimization",
            "Practice transactions, ACID guarantees, and database schema design"
        ]
    ),
    "database": (
        "Database engineering encompasses relational databases (PostgreSQL, MySQL) and NoSQL systems (MongoDB, Redis, Cassandra). "
        "Relational systems guarantee ACID compliance and structured relational schemas with B-tree indexing. NoSQL systems offer "
        "horizontal scaling, flexible schemas, and eventual consistency (BASE model). Modern engineering relies on choosing the right "
        "database for the access pattern: relational for transactional business data, Redis for sub-millisecond caching, and document/columnar for analytics.",
        [
            "Learn relational schema design and normal forms",
            "Understand SQL vs NoSQL architectural trade-offs",
            "Implement caching layers with Redis alongside primary databases"
        ]
    ),
    "docker": (
        "Docker is an open-source containerization platform that packages an application and all its dependencies into an immutable container image. "
        "This eliminates the 'works on my machine' problem and ensures consistent execution across development, staging, and production environments. "
        "Master Dockerfiles, multi-stage builds (for lean production images), container networking, persistent storage volumes, and orchestrating "
        "multi-container stacks with Docker Compose.",
        [
            "Write optimized multi-stage Dockerfiles",
            "Orchestrate application and database containers with Docker Compose",
            "Manage container networking, volumes, and environment variables"
        ]
    ),
    "kubernetes": (
        "Kubernetes (K8s) is the industry-standard container orchestration engine designed to automate deploying, scaling, and managing "
        "containerized workloads across distributed infrastructure. Key primitives include Pods, Deployments (rolling updates, self-healing), "
        "Services (ClusterIP, NodePort, LoadBalancer), ConfigMaps/Secrets, Ingress controllers, and Horizontal Pod Autoscaling (HPA).",
        [
            "Understand Pods, Deployments, and Services",
            "Write Kubernetes YAML manifests for application deployments",
            "Configure Ingress, ConfigMaps, and Horizontal Pod Autoscaling"
        ]
    ),
    "k8s": (
        "Kubernetes (K8s) is the industry-standard container orchestration engine designed to automate deploying, scaling, and managing "
        "containerized workloads across distributed infrastructure. Key primitives include Pods, Deployments (rolling updates, self-healing), "
        "Services (ClusterIP, NodePort, LoadBalancer), ConfigMaps/Secrets, Ingress controllers, and Horizontal Pod Autoscaling (HPA).",
        [
            "Understand Pods, Deployments, and Services",
            "Write Kubernetes YAML manifests for application deployments",
            "Configure Ingress, ConfigMaps, and Horizontal Pod Autoscaling"
        ]
    ),
    "kafka": (
        "Apache Kafka is a distributed event streaming platform used for high-throughput, fault-tolerant publish-subscribe messaging and event-driven "
        "architectures. Instead of point-to-point synchronous HTTP requests, services publish events to topics, and consumer groups process messages "
        "asynchronously at scale. Core concepts include Topics, Partitions, Offsets, Producers, Consumer Groups, and At-Least-Once delivery semantics.",
        [
            "Understand Topics, Partitions, and Consumer Groups",
            "Build an event producer and consumer in your backend language",
            "Implement asynchronous event-driven communication between services"
        ]
    ),
    "redis": (
        "Redis is an open-source, in-memory key-value data structure store used as a database, cache, message broker, and streaming engine. "
        "Because it operates entirely in RAM, Redis delivers sub-millisecond response times. Key use cases include cache-aside caching, "
        "session management, rate limiting (token bucket / leaky bucket algorithms), distributed locks, and leaderboards using Sorted Sets.",
        [
            "Implement cache-aside pattern with TTL expiration",
            "Build an API rate limiter using Redis key counters",
            "Utilize Redis Pub/Sub or Streams for lightweight messaging"
        ]
    ),
    "microservices": (
        "Microservices architecture splits complex monolithic applications into independent, decoupled services organized around distinct business domains. "
        "Each service maintains its own database and communicates via REST APIs, gRPC, or event brokers (Kafka/RabbitMQ). "
        "Essential architectural patterns include API Gateways, Service Discovery, Distributed Tracing (OpenTelemetry), Circuit Breakers (Resilience4j), "
        "and Saga patterns for distributed transactions.",
        [
            "Decompose a monolithic workflow into domain-driven microservices",
            "Set up an API Gateway for routing and authentication",
            "Implement distributed tracing and centralized logging"
        ]
    ),
    "git": (
        "Git is a distributed version control system that tracks source code revisions and enables collaborative development across engineering teams. "
        "Core skills include staging and committing (`git add`, `git commit`), branching strategies (`git checkout -b`, GitHub Flow), merging, "
        "rebasing (`git rebase -i` for clean commit histories), resolving merge conflicts, and conducting thorough code reviews via Pull Requests.",
        [
            "Master branching, merging, and interactive rebasing",
            "Learn resolving merge conflicts cleanly",
            "Practice creating descriptive commits and Pull Requests"
        ]
    ),
    "javascript": (
        "JavaScript is the universal programming language of the modern web, executing both in the browser and on servers via Node.js. "
        "Key language mechanics include lexical scope, closures, prototypal inheritance, the Event Loop (Call Stack, Web APIs, Microtask/Macrotask queues), "
        "Promises, async/await, and ES6+ modern syntax (destructuring, spread/rest, arrow functions, modules).",
        [
            "Master JavaScript Event Loop, closures, and Promises",
            "Build interactive DOM components and handle async API calls",
            "Transition to TypeScript for static typing and enterprise codebases"
        ]
    ),
    "typescript": (
        "TypeScript is a strongly-typed superset of JavaScript developed by Microsoft that compiles to clean JavaScript. "
        "It introduces static type checking, interfaces, type aliases, generics, enums, and utility types (`Partial`, `Pick`, `Record`). "
        "In modern frontend (React, Next.js) and backend (Node.js, Express) engineering, TypeScript dramatically reduces runtime bugs "
        "and enhances developer tooling with powerful autocomplete and refactoring support.",
        [
            "Learn TypeScript interfaces, types, and strict type checking",
            "Master generics and utility types (Partial, Record, Omit)",
            "Refactor a JavaScript project to TypeScript with strict tsconfig"
        ]
    ),
    "react": (
        "React is the leading declarative, component-based JavaScript library for building modern user interfaces. "
        "It leverages a Virtual DOM with a reconciliation algorithm (Fiber) to compute minimal DOM updates. "
        "Core concepts include JSX, component lifecycle, Props, State, React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`), "
        "custom hooks, Context API, and state management libraries (Redux Toolkit, Zustand, React Query).",
        [
            "Master functional components, props, and standard React hooks",
            "Implement custom hooks and server state with React Query",
            "Build a responsive full-featured dashboard with client routing"
        ]
    ),
    "html": (
        "HTML5 (HyperText Markup Language) provides the semantic skeleton and document structure of the web. "
        "Writing clean, accessible semantic HTML (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`) is vital for search engine "
        "optimization (SEO), web performance, and accessibility standards (WCAG, ARIA attributes). "
        "Master forms, validation attributes, input types, and media elements.",
        [
            "Use semantic HTML5 elements for accessible page structure",
            "Build accessible web forms with validation and ARIA attributes",
            "Learn web performance best practices and responsive viewport meta tags"
        ]
    ),
    "css": (
        "CSS3 (Cascading Style Sheets) controls the visual presentation, typography, colors, animations, and responsive layout of web pages. "
        "Modern CSS skills require mastering the Box Model, Flexbox (for 1D layouts), CSS Grid (for 2D layouts), CSS Custom Properties (variables), "
        "media queries for mobile-first responsive design, and CSS transitions/animations for fluid user experiences.",
        [
            "Master CSS Box Model, Flexbox, and CSS Grid layouts",
            "Implement mobile-first responsive design with media queries",
            "Build modern interactive UI components with CSS variables and transitions"
        ]
    ),
    "frontend": (
        "Frontend engineering focuses on crafting accessible, performant, and responsive user experiences in the browser. "
        "The standard engineering progression begins with semantic HTML5 and modern CSS (Flexbox/Grid), advances through JavaScript (ES6+, async/await) "
        "and TypeScript, and culminates in component-driven UI architecture with frameworks like React or Next.js, client-side routing, "
        "state management, and automated UI testing with Jest and Cypress.",
        [
            "Master core Web Foundations (HTML5, Modern CSS, JavaScript)",
            "Build component-based applications with TypeScript and React",
            "Integrate RESTful/GraphQL APIs with state management & caching"
        ]
    ),
    "backend": (
        "Backend engineering powers server-side application logic, data persistence, authentication, and external integrations. "
        "Key pillars include HTTP protocol mechanics, designing RESTful and gRPC APIs, relational data modeling (PostgreSQL/MySQL), "
        "ORM frameworks, security (JWT, OAuth2, HTTPS, CORS, rate limiting), caching strategies (Redis), and containerized deployments (Docker).",
        [
            "Master HTTP, RESTful API design, and JSON payloads",
            "Implement relational data models with SQL and ORMs",
            "Add secure authentication, caching with Redis, and containerize with Docker"
        ]
    ),
    "full stack": (
        "Full Stack engineering bridges user-facing interfaces with server-side business logic and database infrastructure. "
        "A complete full-stack developer understands both ends of the HTTP request lifecycle: constructing intuitive React/TypeScript frontends, "
        "handling API requests through Node.js, Python, or Java backends, executing optimized SQL queries, and deploying containerized applications "
        "to cloud platforms with CI/CD automation.",
        [
            "Build a responsive frontend using React and TypeScript",
            "Create a robust backend REST API connected to a relational database",
            "Deploy the full-stack system with Docker and automated CI/CD pipelines"
        ]
    ),
    "api": (
        "API (Application Programming Interface) design governs how distinct software systems communicate. "
        "REST APIs utilize standard HTTP methods (GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for removal) "
        "and status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error). "
        "Production APIs require thorough input validation, idempotency for payment/mutation endpoints, pagination, and OpenAPI documentation.",
        [
            "Design clean RESTful endpoints adhering to HTTP standards",
            "Implement comprehensive input validation and standardized error payloads",
            "Document APIs using OpenAPI / Swagger specifications"
        ]
    ),
    "cloud": (
        "Cloud computing provides on-demand computational power, storage, and networking over the internet via providers like AWS, GCP, and Azure. "
        "Core cloud engineering concepts include Virtual Machines (EC2), Object Storage (S3), Managed Relational Databases (RDS), "
        "Serverless functions (AWS Lambda), Virtual Private Clouds (VPC networking, subnets, security groups), and Infrastructure as Code (Terraform).",
        [
            "Learn core cloud services (Compute, Storage, Networking, IAM)",
            "Deploy a containerized application to AWS ECS or GCP Cloud Run",
            "Automate cloud infrastructure using Terraform scripts"
        ]
    ),
    "aws": (
        "Amazon Web Services (AWS) is the world's most widely adopted cloud platform. For software engineers, critical AWS services include "
        "IAM (Identity and Access Management for least-privilege security), EC2 (compute instances), S3 (scalable object storage), "
        "RDS (managed PostgreSQL/MySQL), Lambda (serverless event execution), API Gateway, ECS/EKS (container orchestration), "
        "and CloudWatch (monitoring, metrics, and alerting).",
        [
            "Configure IAM policies and roles with least-privilege access",
            "Deploy backend web services to AWS EC2 or ECS with RDS",
            "Set up CloudWatch monitoring, logging, and automated alarms"
        ]
    ),
    "ci/cd": (
        "CI/CD (Continuous Integration and Continuous Deployment) automates building, testing, and deploying code changes into production environments. "
        "Continuous Integration automatically runs linters, unit tests, and security scans on every Pull Request to catch bugs early. "
        "Continuous Deployment automates container building, image tagging, and zero-downtime deployment to staging or production servers (e.g. via GitHub Actions).",
        [
            "Create a GitHub Actions workflow to run linters and tests on PRs",
            "Build and publish Docker images to a container registry",
            "Configure automated zero-downtime deployments to production servers"
        ]
    ),
    "testing": (
        "Software testing guarantees code correctness, prevents regressions, and enables fearless refactoring. "
        "The Testing Pyramid consists of fast, isolated Unit Tests (testing individual functions/classes), Integration Tests "
        "(testing interactions between components, such as API endpoints and real databases), and End-to-End (E2E) Tests "
        "(testing full user flows from browser to database with tools like Playwright or Cypress). Practice Test-Driven Development (TDD) and mocking external APIs.",
        [
            "Write comprehensive unit tests with assertions and mocks",
            "Build integration tests that verify database queries and API routes",
            "Automate test suites in CI/CD pipeline triggers on every commit"
        ]
    )
}

def get_tutor_reply_and_actions(
    message: str,
    role: Optional[str] = None,
    current_skills: Optional[List[str]] = None,
    skill_gaps: Optional[List[str]] = None,
    roadmap_context: Optional[str] = None
) -> Tuple[str, List[str]]:
    """
    Intelligent context-aware engine that generates authentic, high-quality mentor guidance
    for any question, technology, or skill topic.
    """
    q = (message or "").strip()
    ql = q.lower()
    role_str = role or "Software Engineer"
    skills_list = [s for s in (current_skills or []) if s]
    gaps_list = [g for g in (skill_gaps or []) if g]

    # Clean punctuation and find keywords
    clean_words = set(re.findall(r"\b[a-zA-Z0-9+#.-]+\b", ql))

    # 1. Exact or partial topic match in knowledge base
    # Check multi-word topics first (e.g. 'system design', 'spring boot', 'full stack')
    for key in sorted(TOPIC_KNOWLEDGE.keys(), key=lambda k: -len(k)):
        if key in ql:
            explanation, actions = TOPIC_KNOWLEDGE[key]
            reply = f"{explanation} In your journey toward {role_str}, mastering this will significantly strengthen your technical depth and interview readiness."
            return reply, actions

    # 2. Roadmap / "What should I learn next" / "Where to start" queries
    if any(phrase in ql for phrase in ["what should i learn", "learn next", "where to start", "start with", "next step", "how to prepare"]):
        if gaps_list:
            first_gap = gaps_list[0]
            other_gaps = ", ".join(gaps_list[1:]) if len(gaps_list) > 1 else ""
            gaps_phrase = f" followed by {other_gaps}" if other_gaps else ""
            reply = (
                f"For your target role as a {role_str}, your highest priority skill gap to tackle is {first_gap}{gaps_phrase}. "
                f"I recommend a structured 3-phase approach: first, study core architectural principles; second, complete focused "
                f"coding exercises; third, build a production-grade mini-project applying {first_gap} into your portfolio."
            )
            actions = [
                f"Study {first_gap} fundamentals and core architecture",
                f"Build a practical practice project featuring {first_gap}",
                f"Review mock interview questions on {first_gap}"
            ]
            return reply, actions
        else:
            reply = (
                f"For a {role_str}, focus on elevating your foundational skills into full-stack architecture and production scalability. "
                f"Prioritize building end-to-end distributed systems, practicing algorithmic problem solving (DSA Mediums), "
                f"and preparing for behavioral leadership and system design interviews."
            )
            actions = [
                "Build a high-scale portfolio project",
                "Practice System Design tradeoffs and architecture",
                "Complete a full mock technical interview"
            ]
            return reply, actions

    # 3. "Why" questions about the roadmap
    if "why" in ql and roadmap_context:
        reply = (
            f"This topic is an essential milestone in your {role_str} roadmap because modern engineering teams expect "
            f"candidates to understand the complete execution path. Your current roadmap sequence ({roadmap_context}) "
            f"is structured to build foundational competence before progressing into advanced distributed systems and interview checkpoints."
        )
        actions = [
            "Complete current roadmap checkpoint",
            "Review dependency relationships between roadmap nodes",
            "Test your knowledge with a quiz or mock interview"
        ]
        return reply, actions

    # 4. Generalized intelligent technical response for custom queries
    # Extract the user's focus terms
    topic_display = q.capitalize() if len(q) <= 30 else "this topic"
    reply = (
        f"In software engineering and your path toward {role_str}, {topic_display} plays a key role in building reliable, "
        f"scalable systems. When exploring {q}, focus on understanding its underlying mechanisms, trade-offs compared to alternatives, "
        f"and real-world production use cases. "
        f"If you'd like to dive deeper, ask me about specific architectural implementations, best practices, or interview questions!"
    )
    actions = [
        f"Study the core mechanics and best practices of {q[:25]}",
        "Implement a hands-on code sample or architecture diagram",
        f"Analyze real-world trade-offs of {q[:25]} in production"
    ]
    return reply, actions
