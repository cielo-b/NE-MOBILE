# NE-MOBILE Expense Tracker

A modern personal finance tracking mobile application built with React Native and Expo. Track expenses, manage budgets, and visualize spending habits with an intuitive interface.

## ✨ Features

- **User Authentication** - Email/password login with MockAPI integration
- **Expense Management** - Create, edit, delete, and search expenses
- **Budget Tracking** - Set monthly limits and monitor spending
- **Dashboard** - Overview with charts and quick actions
- **Real-time Sync** - Pull-to-refresh data synchronization
- **Modern UI** - Dark theme with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
# Clone and install
git clone <repository-url>
cd NE-MOBILE
npm install

# Start development server
npm start

# Run on platform
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## 🔐 Test Login

Use these credentials to test the app:
- **Email:** `user@gmail.com`
- **Password:** `user123`

## 🛠 Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** Expo Router
- **Styling:** NativeWind (TailwindCSS)
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Backend:** MockAPI

## 📱 App Structure

```
app/
├── (tabs)/           # Main navigation screens
│   ├── dashboard.tsx # Dashboard with overview
│   ├── expenses.tsx  # Expense list & management
│   └── profile.tsx   # User profile
├── login.tsx         # Authentication
├── register.tsx      # User registration
├── expense-form.tsx  # Add/edit expenses
└── expense-details/  # Expense details view

components/
├── ui/              # Reusable UI components
└── expenses/        # Expense-specific components

contexts/            # React Context providers
services/            # API integration
utils/               # Helper functions
```

## 🌐 API Endpoints

**Base URL:** `https://67ac71475853dfff53dab929.mockapi.io/api/v1`

### Authentication
- `GET /users?username={email}` - User login
- `POST /users` - User registration

### Expenses
- `GET /expenses` - List all expenses
- `POST /expenses` - Create expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

## 📋 Usage

### Adding Expenses
1. Navigate to Expenses tab
2. Tap "+" button
3. Fill required fields (title, amount, category)
4. Save expense

### Budget Management
- Set monthly spending limits in Budget Settings
- Monitor progress with visual indicators
- Receive alerts when approaching limits

## 🔧 Development

### Project Configuration
- **Expo Router** for file-based navigation
- **NativeWind** for styling with TailwindCSS
- **TypeScript** for type safety
- **MockAPI** for backend services

### Key Commands
```bash
npm start          # Start development server
npm run reset      # Reset cache and restart
expo install       # Install Expo-compatible packages
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ using React Native and Expo** 