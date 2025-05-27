# Finance Tracker Mobile App

A comprehensive personal finance tracking mobile application built with React Native, Expo, and TypeScript. Track your daily expenses, set budgets, and visualize your spending habits with a beautiful, modern UI.

## 🚀 Features

### Core Functionality
- **User Authentication**: Login using valid username/email from MockAPI
- **Expense Management**: Create, read, update, and delete expenses
- **Budget Tracking**: Set category-wise budgets and monitor spending
- **Dashboard**: Overview of expenses with charts and statistics
- **Search & Filter**: Find expenses by title, category, or description

### Technical Features
- **Cross-Platform**: iOS and Android compatible
- **Modern UI/UX**: Beautiful design with animations and smooth transitions
- **Form Validation**: Comprehensive input validation with error handling
- **Offline Storage**: User session management with AsyncStorage
- **Toast Notifications**: User-friendly feedback for all actions
- **Pull-to-Refresh**: Real-time data synchronization

## 📱 Screenshots

The app includes the following screens:
- Login Screen with form validation
- Dashboard with expense overview and quick actions
- Expenses list with search and filtering
- Add/Edit expense form with category picker
- Expense details view
- Budget tracking with progress indicators
- User profile with statistics

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Icons**: Expo Vector Icons (Ionicons)
- **Notifications**: React Native Toast Message

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NE-MOBILE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 🔗 API Endpoints

The app uses MockAPI for backend services:

### Base URL
```
https://67ac71475853dfff53dab929.mockapi.io/api/v1
```

### Endpoints

#### Users
- `GET /users?username={email}` - User authentication
- `GET /users/{userId}` - Get user details

#### Expenses
- `GET /expenses` - Get all expenses
- `GET /expenses/{expenseId}` - Get specific expense
- `POST /expenses` - Create new expense
- `PUT /expenses/{expenseId}` - Update expense
- `DELETE /expenses/{expenseId}` - Delete expense

## 📁 Project Structure

```
├── app/                          # App screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── dashboard.tsx         # Dashboard screen
│   │   ├── expenses.tsx          # Expenses list screen
│   │   ├── budget.tsx            # Budget tracking screen
│   │   └── profile.tsx           # User profile screen
│   ├── expense-details/[id].tsx  # Expense details screen
│   ├── expense-form.tsx          # Add/Edit expense form
│   ├── login.tsx                 # Login screen
│   └── _layout.tsx               # Root layout with providers
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   │   ├── Button.tsx            # Custom button component
│   │   ├── Input.tsx             # Custom input component
│   │   ├── Card.tsx              # Card container component
│   │   └── Loading.tsx           # Loading indicator
│   └── expenses/                 # Expense-specific components
│       └── ExpenseCard.tsx       # Expense list item
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication context
├── services/                     # API services
│   └── api.ts                    # API client and endpoints
├── types/                        # TypeScript type definitions
│   └── index.ts                  # App-wide types
├── utils/                        # Utility functions
│   ├── storage.ts                # AsyncStorage utilities
│   ├── validation.ts             # Form validation functions
│   └── formatters.ts             # Data formatting utilities
└── global.css                   # Global styles for NativeWind
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#0284c7)
- **Success**: Green (#22c55e)
- **Danger**: Red (#ef4444)
- **Warning**: Orange (#f59e0b)

### Typography
- **Headings**: Bold, various sizes
- **Body**: Regular weight, readable sizes
- **Captions**: Smaller, muted colors

### Components
- **Cards**: Elevated with shadows
- **Buttons**: Multiple variants (primary, secondary, outline, danger)
- **Inputs**: Focused states with validation
- **Icons**: Consistent Ionicons usage

## 🔧 Configuration

### Environment Setup
The app is configured to work with the provided MockAPI endpoints. No additional environment variables are required.

### NativeWind Setup
TailwindCSS is configured through:
- `tailwind.config.js` - TailwindCSS configuration
- `metro.config.js` - Metro bundler configuration
- `babel.config.js` - Babel configuration for NativeWind

## 📱 Usage

### Login
1. Enter any valid email format (e.g., user@example.com)
2. Enter any password (minimum 6 characters)
3. The app will authenticate against the MockAPI users endpoint

### Adding Expenses
1. Navigate to the Expenses tab
2. Tap the "+" button or use "Add Expense" from dashboard
3. Fill in the expense details:
   - Title (required)
   - Amount (required, numeric)
   - Category (required, from predefined list)
   - Date (required, cannot be future date)
   - Description (optional)
4. Submit to save

### Budget Tracking
- View monthly budget overview on the Budget tab
- See category-wise spending vs. limits
- Progress bars show spending percentage
- Color-coded indicators (green, yellow, orange, red)

### Profile & Statistics
- View personal expense statistics
- See total spent, monthly averages, top categories
- Access app settings and logout

## 🧪 Testing

The app includes comprehensive validation and error handling:
- Form validation with real-time feedback
- API error handling with user-friendly messages
- Loading states for all async operations
- Confirmation dialogs for destructive actions

## 🚀 Deployment

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### Expo Application Services (EAS)
For modern builds, use EAS Build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

- Push notifications for budget limits
- Data export functionality
- Charts and analytics
- Recurring expense tracking
- Multiple currency support
- Dark mode theme
- Biometric authentication 