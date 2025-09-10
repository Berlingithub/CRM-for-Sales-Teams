# CRM for Sales Teams

A comprehensive Customer Relationship Management (CRM) system built for sales teams to manage leads, opportunities, and sales pipeline with role-based access control.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Lead Management**: Complete CRUD operations for managing leads
- **Opportunity Management**: Track and manage sales opportunities
- **Lead to Opportunity Conversion**: Convert qualified leads into opportunities
- **Role-Based Data Access**: Sales reps see only their data, managers see all data
- **Dashboard Analytics**: Visual insights into leads and opportunities

### User Roles
- **Sales Representative**: Manage own leads and opportunities
- **Sales Manager**: View and manage all leads and opportunities
- **Administrator**: Full user management and system access

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Data**: Instant updates across all components
- **Clean UI/UX**: Professional interface with intuitive navigation
- **Search & Filtering**: Advanced search and filter capabilities
- **Data Persistence**: JSON file-based storage for MVP simplicity

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **JavaScript** - Programming language (ES6+)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development
- **Concurrently** - Run multiple commands simultaneously
- **ESLint** - Code linting and formatting

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd crm-sales-teams
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

   This will start both the frontend (port 3000) and backend (port 5000) simultaneously.

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 Demo Accounts

The system comes with pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@crm.com | admin123 |
| Sales Manager | manager@crm.com | manager123 |
| Sales Representative | rep@crm.com | rep123 |

## 📁 Project Structure

```
crm-sales-teams/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin user management
│   ├── dashboard/         # Main dashboard
│   ├── leads/             # Lead management
│   ├── login/             # Authentication
│   ├── opportunities/     # Opportunity management
│   └── register/          # User registration
├── components/            # Reusable React components
│   └── Layout.js         # Main layout wrapper
├── server/               # Backend Express.js server
│   ├── data/            # JSON data storage
│   └── index.js         # Main server file
├── public/              # Static assets
└── README.md           # Project documentation
```

## 🔐 Authentication & Authorization

### JWT Token-based Authentication
- Secure login/logout functionality
- Token expiration handling (24 hours)
- Automatic token validation on protected routes

### Role-Based Access Control (RBAC)
- **Sales Rep**: Access to own leads and opportunities only
- **Manager**: Access to all leads and opportunities
- **Admin**: Full system access including user management

## 📊 Data Models

### Users
```javascript
{
  "id": "u123",
  "name": "Alice Smith",
  "email": "alice@company.com",
  "password": "hashed_password",
  "role": "rep" // rep | manager | admin
}
```

### Leads
```javascript
{
  "id": "l001",
  "name": "John Prospect",
  "email": "john@prospect.com",
  "phone": "555-0123",
  "status": "New", // New | Contacted | Qualified
  "ownerId": "u123",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Opportunities
```javascript
{
  "id": "o001",
  "title": "John Prospect - Enterprise Deal",
  "value": 50000,
  "stage": "Discovery", // Discovery | Proposal | Won | Lost
  "ownerId": "u123",
  "leadId": "l001",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

## 🔄 Core Workflows

### 1. User Authentication
1. User logs in with email/password
2. Server validates credentials
3. JWT token issued for valid users
4. Token included in subsequent API requests

### 2. Lead Management
1. Sales reps create and manage their leads
2. Managers can view and edit all leads
3. Lead status updates track progress
4. Search and filter capabilities

### 3. Lead to Opportunity Conversion
1. User selects qualified lead
2. Clicks "Convert" button
3. Enters opportunity details (title, value)
4. System creates opportunity and updates lead status

### 4. Opportunity Management
1. Track opportunity stages and values
2. Update stages as deals progress
3. Monitor pipeline value and conversion rates

## 🎨 UI/UX Features

### Design System
- **Primary Colors**: Blue (#3B82F6) for main actions
- **Secondary Colors**: Emerald (#10B981) for opportunities
- **Status Colors**: Contextual colors for different states
- **Typography**: Inter font family for readability
- **Spacing**: 8px grid system for consistency

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Adaptive Navigation**: Collapsible sidebar on mobile

### Interactive Elements
- **Hover Effects**: Subtle transitions on buttons and cards
- **Loading States**: Spinners for async operations
- **Form Validation**: Real-time validation feedback
- **Modal Dialogs**: Clean modal interfaces for forms

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
For production deployment, set the following environment variables:
- `JWT_SECRET`: Secure secret key for JWT tokens
- `NODE_ENV`: Set to "production"
- `PORT`: Server port (defaults to 5000)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Leads
- `GET /api/leads` - Get leads (filtered by role)
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/convert` - Convert lead to opportunity

### Opportunities
- `GET /api/opportunities` - Get opportunities (filtered by role)
- `POST /api/opportunities` - Create opportunity
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@crm-sales-teams.com

## 🎯 Future Enhancements

- Email integration for lead communication
- Advanced reporting and analytics
- Calendar integration for scheduling
- File attachment support
- Bulk operations for leads/opportunities
- Advanced pipeline visualization
- Mobile app development
- Integration with popular CRM platforms

---

**Built with ❤️ for sales teams who want to focus on selling, not managing spreadsheets.**