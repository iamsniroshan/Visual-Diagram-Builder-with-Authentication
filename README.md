# Visual Diagram Builder with Authentication

A React-based diagram builder application with Firebase authentication and Firestore integration. Features include role-based access control, dark mode, diagram sharing, and comprehensive testing.

## Features

### Authentication & Authorization
- **Email/Password Authentication**: Secure login and registration via Firebase
- **Role-based Access Control**: 
  - **Editors**: Full CRUD operations on diagrams, nodes, and edges
  - **Viewers**: Read-only access to diagrams
- **User Registration**: Built-in registration flow with role selection

### Core Features
- **Dashboard**: View and manage all your diagrams (owned and shared)
- **Diagram Editor**: Create interactive diagrams with React Flow
  - Draggable nodes with customizable positions
  - Connectable edges between nodes
  - Editable labels for all nodes
  - Real-time save to Firestore
  - Visual feedback for editing operations
- **Profile Page**: View user information and manage account

### Bonus Features ✨
- **🌓 Dark Mode**: Toggle between light and dark themes with persistent preference
- **👥 Diagram Sharing**: Editors can invite users by email with granular access control
  - Share with "view" access (read-only)
  - Share with "edit" access (full editing rights)
- **🧪 Unit Tests**: Comprehensive test coverage for components and hooks
- **🎨 Modern UI**: Clean, responsive design with smooth animations

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── LoadingSpinner.tsx
│   ├── ThemeToggle.tsx
│   └── ShareDiagramModal.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── hooks/             # Custom React hooks
│   ├── useTheme.ts
│   └── useDiagrams.ts
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── DiagramEditor.tsx
│   └── Profile.tsx
├── services/          # Business logic & API calls
│   ├── authService.ts
│   └── diagramService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── styles/            # CSS modules
└── tests/             # Test setup and utilities
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**: 
   - Go to Authentication > Sign-in method
   - Enable Email/Password
4. Enable **Firestore Database**: 
   - Go to Firestore Database
   - Create database (start in test mode, we'll add rules later)
5. Get your Firebase configuration:
   - Project Settings > General
   - Scroll to "Your apps" section
   - Copy the config object

### 3. Update Firebase Configuration

Open [src/firebase.ts](src/firebase.ts) and replace the configuration with your Firebase project details.

### 4. Deploy Firestore Security Rules

The project includes production-ready security rules in [firestore.rules](firestore.rules). Deploy them:

```bash
firebase deploy --only firestore:rules
```

Or manually copy the rules from `firestore.rules` to your Firebase Console.

### 5. Create Initial Users

You can create users in two ways:

#### Option A: Use the Registration Form
1. Run the app: `npm run dev`
2. Click "Don't have an account? Register"
3. Fill in email, password, and select role
4. Register

#### Option B: Manual Firebase Console Setup
1. **Create user accounts in Firebase Authentication**:
   - Go to Firebase Console > Authentication > Users
   - Click "Add user"
   - Enter email and password for each user

2. **For each user, create a document in Firestore**:
   - Go to Firestore Database
   - Collection: `users`
   - Document ID: User's Firebase Auth UID (copy from Authentication > Users)
   - Add fields:
     ```json
     {
       "email": "user@example.com",
       "role": "editor"
     }
     ```
     Or use `"role": "viewer"` for read-only access

### 6. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```
     ```json
     {
       "email": "user@example.com",
       "role": "editor"
     }
     ```
     Or use `"role": "viewer"` for read-only access

### 5. Run the Application

```

## Technologies Used

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router 7
- **State Management**: React Context API
- **Styling**: CSS with CSS Variables (theme support)
- **Diagram Library**: React Flow (@xyflow/react)
- **Backend**: Firebase
  - Authentication (Email/Password)
  - Firestore Database (NoSQL)
- **Build Tool**: Vite 7
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + TypeScript strict mode

## Features Implementation

### Authentication Flow
1. User navigates to login page
2. Can either login with existing credentials or register new account
3. On registration, user selects role (editor/viewer)
4. User data stored in Firestore `users` collection
5. Protected routes redirect to dashboard after authentication

### Role-Based Access
- Firestore security rules enforce role-based permissions
- Editors can create, edit, delete diagrams and share them
- Viewers can only read diagrams they have access to
- UI elements conditionally rendered based on user role

### Diagram Sharing
1. Diagram owner clicks "Share" button
2. Enters email and selects access level (view/edit)
3. Shared user appears in diagram's `sharedWith` array
4. Firestore rules grant access based on this array
5. Shared diagrams appear in both users' dashboards

### Theme System
- Uses CSS custom properties for theming
- Theme preference stored in localStorage
- `data-theme` attribute on document root
- All components support both themes

## Testing

Run tests with:

```bash
npm run test          # Run tests in watch mode
npm run test:ui       # Run tests with UI interface
npm run test:coverage # Generate coverage report
```

Test files:
- `src/hooks/useTheme.test.ts` - Tests theme toggle functionality
- `src/components/LoadingSpinner.test.tsx` - Tests loading component

## Security

### Firestore Security Rules
The project includes production-ready security rules that:
- Require authentication for all operations
- Enforce role-based access (editor/viewer)
- Allow users to read only their own user documents
- Restrict diagram access to owners and shared users
- Prevent unauthorized modifications

### Best Practices
- No 'any' types in TypeScript
- Proper error handling throughout
- Input validation on forms
- Secure Firebase configuration
- Protected routes for authenticated content

## Development Guidelines

### Adding New Features
1. Create service in `src/services/` for business logic
2. Create custom hook in `src/hooks/` if needed
3. Build reusable component in `src/components/`
4. Add types to `src/types/index.ts`
5. Write tests for new functionality

### Code Style
- Use functional components with hooks
- Prefer named exports for better refactoring
- Keep components small and focused
- Extract business logic to services
- Use TypeScript strict mode

## Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
1. Build: `npm run build`
2. Deploy `dist` folder to your hosting provider

## Troubleshooting

### "Permission denied" errors
- Check Firestore security rules are deployed
- Verify user has correct role in Firestore
- Ensure user document exists in `users` collection

### Theme not persisting
- Check localStorage is enabled in browser
- Verify `useTheme` hook is imported correctly

### Tests failing
- Run `npm install` to ensure all test dependencies are installed
- Clear test cache: `npx vitest --clearCache`

## Future Enhancements

Potential features to add:
- [ ] Real-time collaboration (multiple users editing simultaneously)
- [ ] Diagram templates and presets
- [ ] Export diagrams as images (PNG/SVG)
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Diagram versioning/history
- [ ] Comments and annotations
- [ ] Mobile responsive touch controls

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

---

Built with ❤️ using React, TypeScript, and Firebase
