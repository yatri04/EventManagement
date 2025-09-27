# 🎟 Event Registration System

A modern, full-stack web application for managing event registrations with limited capacity. Built with Node.js, Express, MongoDB Atlas, and a beautiful cyberpunk-themed frontend.

## 🌟 Features

### 👤 Student Features
- *User Registration & Authentication* - Secure JWT-based authentication
- *Event Discovery* - Browse available events with real-time capacity
- *Event Registration* - Register for events until capacity is reached
- *Waiting List* - Automatic waiting list when events are full
- *Profile Management* - Complete student profile with event history
- *Email Notifications* - Beautiful confirmation emails for registrations
- *Real-time Updates* - Live capacity tracking and status updates

### 🛡 Admin Features
- *Event Management* - Create, update, and delete events
- *Capacity Control* - Set and manage event capacity limits
- *Participant Tracking* - View all registered students and waiting lists
- *Analytics Dashboard* - Real-time statistics and insights
- *Email System* - Automated email notifications
- *User Management* - Manage student accounts and permissions

## 🚀 Tech Stack

### Backend
- *Node.js* - Runtime environment
- *Express.js* - Web framework
- *MongoDB Atlas* - Cloud database
- *Mongoose* - ODM for MongoDB
- *JWT* - Authentication tokens
- *Nodemailer* - Email notifications
- *Bcryptjs* - Password hashing

### Frontend
- *HTML5* - Structure
- *CSS3* - Styling with cyberpunk theme
- *JavaScript (ES6+)* - Interactive functionality
- *Font Awesome* - Icons
- *Responsive Design* - Mobile-friendly

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Gmail account (for email notifications)
- Modern web browser

## 🛠 Installation

### 1. Clone the Repository
bash
git clone <repository-url>
cd EventManagement


### 2. Install Backend Dependencies
bash
cd backend
npm install


### 3. Environment Setup
Create a .env file in the backend directory:

env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=5000

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here


### 4. MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)
4. Create a database user with read/write permissions
5. Get your connection string and update MONGODB_URI

### 5. Gmail Setup (for email notifications)
1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password for "Mail"
3. Use the 16-character password in EMAIL_PASS

## 🚀 Running the Application

### Start the Backend Server
bash
cd backend
npm start


The server will start on http://localhost:5000

### Access the Frontend
Open index.html in your web browser or serve it with a local server:

bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server -p 8000


## 📁 Project Structure


EventManagement/
├── backend/
│   ├── models/
│   │   ├── Event.js          # Event schema
│   │   └── Student.js        # Student schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── events.js         # Event management routes
│   │   ├── registration.js   # Registration routes
│   │   └── admin.js          # Admin routes
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── server.js             # Main server file
│   ├── seed.js               # Database seeding script
│   └── .env                  # Environment variables
├── frontend/
│   ├── index.html            # Home page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── my-profile.html       # Student profile page
│   ├── admin-panel.html      # Admin dashboard
│   ├── styles.css            # Main stylesheet
│   └── event-registration.js # Frontend JavaScript
└── README.md                 # This file


## 🔧 API Endpoints

### Authentication
- POST /api/auth/register - Register new student
- POST /api/auth/login - Login student/admin
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile

### Events
- GET /api/events - Get all events
- POST /api/events - Create event (Admin only)
- PUT /api/events/:id - Update event (Admin only)
- DELETE /api/events/:id - Delete event (Admin only)

### Registration
- POST /api/registration/register - Register for event
- DELETE /api/registration/:eventId - Cancel registration
- GET /api/registration/my-events - Get user's registered events

### Admin
- GET /api/admin/dashboard - Admin dashboard data
- GET /api/admin/events - All events with statistics
- GET /api/admin/events/:id/participants - Event participants

## 🎨 UI Features

### Cyberpunk Theme
- *Matrix Rain Background* - Animated digital rain effect
- *Glassmorphism* - Frosted glass design elements
- *Neon Glows* - Electric blue and pink accents
- *Morphing Shapes* - Animated geometric backgrounds
- *Particle System* - Floating particle effects

### Responsive Design
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interactions
- Cross-browser compatibility

## 📧 Email System

The system sends beautiful HTML emails for:
- *Registration Confirmation* - When students register for events
- *Waiting List Notification* - When added to waiting list
- *Cancellation Confirmation* - When registration is cancelled

### Email Templates Include:
- Event details (name, date, time, location)
- Registration status (confirmed/waiting)
- Seat information and capacity
- Professional styling with gradients
- Mobile-responsive design

## 🔐 Security Features

- *JWT Authentication* - Secure token-based auth
- *Password Hashing* - Bcrypt for password security
- *Input Validation* - Server-side validation
- *CORS Protection* - Cross-origin request security
- *Environment Variables* - Sensitive data protection

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect to GitHub repository
4. Enable automatic deploys

### Frontend Deployment (Netlify/Vercel)
1. Connect repository to deployment platform
2. Set build command (if needed)
3. Configure redirects for SPA routing

## 🧪 Testing

### Test Email Functionality
bash
cd backend
node test-email.js


### Test Database Connection
bash
cd backend
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');"


## 📊 Database Schema

### Event Model
javascript
{
  eventName: String,
  description: String,
  date: Date,
  location: String,
  capacity: Number,
  participants: [{
    studentId: ObjectId,
    name: String,
    email: String
  }],
  waitingList: [{
    studentId: ObjectId,
    name: String,
    email: String
  }],
  isActive: Boolean
}


### Student Model
javascript
{
  name: String,
  email: String,
  password: String,
  studentId: String,
  phone: String,
  department: String,
  year: String,
  bio: String,
  isAdmin: Boolean,
  registeredEvents: [{
    eventId: ObjectId,
    registrationDate: Date
  }]
}


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

*MongoDB Connection Failed*
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure database user has proper permissions

*Email Not Sending*
- Verify Gmail App Password
- Check 2FA is enabled
- Confirm EMAIL_USER and EMAIL_PASS are set

*Port Already in Use*
bash
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F


### Getting Help
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed
- Test individual components (database, email, etc.)

## 🎯 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Mobile app with React Native
- [ ] Advanced analytics and reporting
- [ ] Payment integration for paid events
- [ ] QR code check-in system
- [ ] Event feedback and ratings
- [ ] Social media integration
- [ ] Multi-language support

---

*Built with ❤ for modern event management*

Last updated: December 2024
