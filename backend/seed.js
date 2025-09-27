const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Student = require('./models/Student');

// Load environment variables
dotenv.config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://23ce027:xZl2I1siCBjJFxKv@cluster0.3j72tt9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample events data
const sampleEvents = [
    {
        eventName: "Tech Conference 2024",
        description: "Annual technology conference featuring the latest trends in AI, blockchain, and cloud computing. Join industry experts and thought leaders for insightful discussions and networking opportunities.",
        date: new Date('2025-03-15T09:00:00Z'),
        capacity: 150,
        location: "Convention Center, Downtown",
        organizer: "Tech Innovation Society",
        organizerEmail: "events@techinnovation.org",
        registrationDeadline: new Date('2024-03-10T23:59:59Z'),
        tags: ["Technology", "AI", "Networking", "Conference"]
    },
    {
        eventName: "Web Development Workshop",
        description: "Hands-on workshop covering modern web development technologies including React, Node.js, and MongoDB. Perfect for beginners and intermediate developers.",
        date: new Date('2025-02-20T10:00:00Z'),
        capacity: 30,
        location: "Computer Lab 101",
        organizer: "Computer Science Department",
        organizerEmail: "csdept@university.edu",
        registrationDeadline: new Date('2025-02-15T23:59:59Z'),
        tags: ["Web Development", "React", "Node.js", "Workshop"]
    },
    {
        eventName: "Data Science Bootcamp",
        description: "Intensive 3-day bootcamp covering data analysis, machine learning, and visualization using Python and R. Bring your laptop and get ready to dive deep into data science.",
        date: new Date('2025-04-05T09:00:00Z'),
        capacity: 25,
        location: "Data Science Lab",
        organizer: "Data Science Club",
        organizerEmail: "datascience@university.edu",
        registrationDeadline: new Date('2025-03-30T23:59:59Z'),
        tags: ["Data Science", "Python", "Machine Learning", "Bootcamp"]
    },
    {
        eventName: "Mobile App Development Seminar",
        description: "Learn about mobile app development for iOS and Android platforms. Topics include UI/UX design, native development, and cross-platform solutions.",
        date: new Date('2025-03-01T14:00:00Z'),
        capacity: 50,
        location: "Auditorium A",
        organizer: "Mobile Development Society",
        organizerEmail: "mobile@university.edu",
        registrationDeadline: new Date('2025-02-25T23:59:59Z'),
        tags: ["Mobile Development", "iOS", "Android", "UI/UX"]
    },
    {
        eventName: "Cybersecurity Workshop",
        description: "Essential cybersecurity practices and threat mitigation strategies. Learn about ethical hacking, network security, and data protection.",
        date: new Date('2025-02-28T10:00:00Z'),
        capacity: 40,
        location: "Security Lab",
        organizer: "Cybersecurity Club",
        organizerEmail: "cybersecurity@university.edu",
        registrationDeadline: new Date('2025-02-22T23:59:59Z'),
        tags: ["Cybersecurity", "Ethical Hacking", "Network Security", "Workshop"]
    },
    {
        eventName: "Startup Pitch Competition",
        description: "Showcase your innovative business ideas and compete for prizes. Open to all students with entrepreneurial aspirations. Mentors and investors will be present.",
        date: new Date('2025-04-20T09:00:00Z'),
        capacity: 100,
        location: "Business School Auditorium",
        organizer: "Entrepreneurship Society",
        organizerEmail: "entrepreneurship@university.edu",
        registrationDeadline: new Date('2025-04-10T23:59:59Z'),
        tags: ["Entrepreneurship", "Pitch Competition", "Business", "Innovation"]
    },
    {
        eventName: "UI/UX Design Masterclass",
        description: "Master the art of user interface and user experience design. Learn design principles, prototyping tools, and user research methodologies.",
        date: new Date('2025-03-10T10:00:00Z'),
        capacity: 35,
        location: "Design Studio",
        organizer: "Design Society",
        organizerEmail: "design@university.edu",
        registrationDeadline: new Date('2025-03-05T23:59:59Z'),
        tags: ["UI/UX", "Design", "Prototyping", "User Research"]
    },
    {
        eventName: "Cloud Computing Workshop",
        description: "Introduction to cloud platforms including AWS, Azure, and Google Cloud. Hands-on experience with cloud services and deployment strategies.",
        date: new Date('2025-03-25T09:00:00Z'),
        capacity: 45,
        location: "Cloud Lab",
        organizer: "Cloud Computing Society",
        organizerEmail: "cloud@university.edu",
        registrationDeadline: new Date('2025-03-20T23:59:59Z'),
        tags: ["Cloud Computing", "AWS", "Azure", "Deployment"]
    }
];

// Sample admin student
const adminStudent = {
    name: "Admin User",
    email: "admin@university.edu",
    password: "admin123",
    studentId: "ADMIN001",
    phone: "+1234567890",
    department: "Administration",
    year: "Other",
    bio: "System Administrator",
    isAdmin: true
};

// Sample regular students
const sampleStudents = [
    {
        name: "John Doe",
        email: "john.doe@university.edu",
        password: "password123",
        studentId: "STU001",
        phone: "+1234567891",
        department: "Computer Science",
        year: "3rd Year",
        bio: "Passionate about web development and machine learning."
    },
    {
        name: "Jane Smith",
        email: "jane.smith@university.edu",
        password: "password123",
        studentId: "STU002",
        phone: "+1234567892",
        department: "Data Science",
        year: "2nd Year",
        bio: "Interested in data analysis and visualization."
    },
    {
        name: "Mike Johnson",
        email: "mike.johnson@university.edu",
        password: "password123",
        studentId: "STU003",
        phone: "+1234567893",
        department: "Information Technology",
        year: "4th Year",
        bio: "Focusing on cybersecurity and network administration."
    }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await Event.deleteMany({});
        await Student.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin student
        const admin = await Student.create(adminStudent);
        console.log('👤 Created admin user');

        // Create sample students
        const students = await Student.create(sampleStudents);
        console.log(`👥 Created ${students.length} sample students`);

        // Create sample events
        const events = await Event.create(sampleEvents);
        console.log(`📅 Created ${events.length} sample events`);

        // Register some students for events (simulate some registrations)
        const event1 = events[0]; // Tech Conference
        const event2 = events[1]; // Web Development Workshop
        
        // Register students for Tech Conference
        for (let i = 0; i < Math.min(5, students.length); i++) {
            try {
                await event1.registerStudent(students[i]._id);
                await students[i].registerForEvent(event1._id);
            } catch (error) {
                console.log(`Note: Could not register student ${students[i].name} for event ${event1.eventName}`);
            }
        }

        // Register students for Web Development Workshop
        for (let i = 0; i < Math.min(3, students.length); i++) {
            try {
                await event2.registerStudent(students[i]._id);
                await students[i].registerForEvent(event2._id);
            } catch (error) {
                console.log(`Note: Could not register student ${students[i].name} for event ${event2.eventName}`);
            }
        }

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Admin user: ${admin.email} (password: admin123)`);
        console.log(`- Sample students: ${students.length} created`);
        console.log(`- Sample events: ${events.length} created`);
        console.log(`- Some students registered for events`);
        
        console.log('\n🔑 Login credentials:');
        console.log('Admin: admin@university.edu / admin123');
        console.log('Student: john.doe@university.edu / password123');
        console.log('Student: jane.smith@university.edu / password123');
        console.log('Student: mike.johnson@university.edu / password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run seeding
connectDB().then(() => {
    seedDatabase();
});
