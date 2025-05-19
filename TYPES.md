# TypeScript Type Organization Guide

This project uses a centralized type system to ensure consistency and maintainability. All TypeScript types are organized in the `src/types` directory, categorized by domain.

## Type Structure

The types are organized into the following categories:

1. **User Types** (`src/types/user.ts`)
   - User information and authentication-related types
   - Includes `UserInfo`, `CodeforcesUserData`, `AboutUser`, etc.

2. **Problem Types** (`src/types/problems.ts`)
   - Problem and submission-related types
   - Includes `Submissions`, `Problem`, `ProblemStats`, etc.

3. **Contest Types** (`src/types/contests.ts`)
   - Contest and rating-related types
   - Includes `Rating`, `UpcomingContest`, `TagStatistics`, etc.

4. **Component Props** (`src/types/props.ts`)
   - Types for React component props
   - Includes `CodeforcesUserCardProps`, `ImprovementSuggestionProps`, etc.

## Usage

Import types from the central location instead of defining them inline or importing from component files:

```typescript
// Good
import { UserInfo, CodeforcesUserData } from "@/types";
// or more specifically
import { UserInfo } from "@/types/user";

// Bad
import { UserInfo } from "@/app/types";  // Old location
// or
interface UserInfo {  // Duplicating type definitions
  // ...
}
```

## Adding New Types

When adding new types:

1. Identify which category it belongs to
2. Add it to the appropriate file in `src/types/`
3. Add proper JSDoc comments to document the type
4. Export it from the file
5. Update `src/types/index.ts` if needed

## Benefits

- Reduces duplication
- Centralized location for all type definitions
- Easier to maintain and refactor
- Better code completion and documentation
