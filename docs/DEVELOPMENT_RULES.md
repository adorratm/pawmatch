# PawMatch Development Rules & DDD Standards

## 📱 Mobile (React Native) DDD Structure

### 1. Domain Layer (`src/domain`)
- **Entities**: Pure objects with business logic (e.g., `Pet.ts`).
- **Repositories**: Interfaces defining data access (e.g., `IPetRepository.ts`).
- **Value Objects**: Multi-attribute data types without identity (e.g., `Location.ts`).

### 2. Infrastructure Layer (`src/infrastructure`)
- **Repositories**: Concrete implementations using `api` or `AsyncStorage` (e.g., `ApiPetRepository.ts`).
- **API Client**: Standardized Axios instance in `infrastructure/api/api.ts`.
- **Services**: Low-level services (Socket, Auth).

### 3. Application Layer (`src/application`)
- **Stores**: Zustand stores that consume Domain Repositories (e.g., `petStore.ts`).
- **Use Cases**: Optional orchestration logic (kept in stores for simplicity in this project).

### 4. Presentation Layer (`src/presentation`)
- **Screens**: React Native components using stores/hooks.
- **Components**: Reusable UI elements aligned with `Plus Jakarta Sans` design system.

## ⚙️ Backend (NestJS) Standards

- **EntityManager**: Use `this.entityManager.transaction()` for all multi-step database operations.
- **No Repository Injection**: Avoid `@InjectRepository()`, use `EntityManager` directly for better control and performance.
- **DTOs**: Strict validation using `class-validator`.

## 🎨 UI & UX Standards

- **Typography**: Strictly use `Plus Jakarta Sans`.
- **Colors**: Use tokens from `presentation/styles/config.ts`.
- **Consistency**: UI must align with the provided high-fidelity design assets in `pawmatch-design`.
