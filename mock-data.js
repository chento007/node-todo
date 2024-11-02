// mockData.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs"); // For writing JSON to a file (optional)
const User = require("./api/models/users");
const Job = require("./api/models/jobs");

// Load environment variables
dotenv.config({ path: "./.env" });
console.log("db url:", process.env.DB_LOCAL_URI);

// Connect to MongoDB
mongoose.connect(process.env.DB_LOCAL_URI, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
    family: 4
})
    .then(() => console.log("Database connected"))
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
    });

// Predefined list of 20 users
const users = [
    { name: "Alice Johnson", email: "alice@gmail.com", role: "user", password: "password123" },
    { name: "Bob Smith", email: "bob@gmail.com", role: "employer", password: "password123" },
    { name: "Charlie Brown", email: "charlie@gmail.com", role: "user", password: "password123" },
    { name: "David Wilson", email: "david@gmail.com", role: "user", password: "password123" },
    { name: "Eve Adams", email: "eve@gmail.com", role: "employer", password: "password123" },
    { name: "Frank White", email: "frank@gmail.com", role: "user", password: "password123" },
    { name: "Grace Lewis", email: "grace@gmail.com", role: "employer", password: "password123" },
    { name: "Hank Hill", email: "hank@gmail.com", role: "user", password: "password123" },
    { name: "Ivy Scott", email: "ivy@gmail.com", role: "user", password: "password123" },
    { name: "Jack King", email: "jack@gmail.com", role: "employer", password: "password123" },
    { name: "Karen Green", email: "karen@gmail.com", role: "user", password: "password123" },
    { name: "Leo Clark", email: "leo@gmail.com", role: "user", password: "password123" },
    { name: "Mia Young", email: "mia@gmail.com", role: "employer", password: "password123" },
    { name: "Nina Hall", email: "nina@gmail.com", role: "user", password: "password123" },
    { name: "Oscar Turner", email: "oscar@gmail.com", role: "user", password: "password123" },
    { name: "Paul Wright", email: "paul@gmail.com", role: "employer", password: "password123" },
    { name: "Quinn Baker", email: "quinn@gmail.com", role: "user", password: "password123" },
    { name: "Rita Martinez", email: "rita@gmail.com", role: "employer", password: "password123" },
    { name: "Sam Lee", email: "sam@gmail.com", role: "user", password: "password123" },
    { name: "Tina Hernandez", email: "tina@gmail.com", role: "user", password: "password123" }
];

// Predefined list of 20 jobs, assigned to specific user IDs after users are inserted
const createMockJob = (userId) => [
    { title: "Software Engineer", description: "Develop and maintain software solutions.", email: "hr@gmail.com", address: "123 Main St", company: "Tech Solutions", industry: ["Information Technology"], jobType: "Permanent", minEducation: "Bachelors", positions: 2, experience: "1 Year - 2 Years", salary: 80000, user: userId },
    { title: "Marketing Specialist", description: "Create marketing strategies to promote products.", email: "marketing@gmail.com", address: "456 Oak St", company: "Marketing Pro", industry: ["Business", "Telecommunication"], jobType: "Permanent", minEducation: "Bachelors", positions: 1, experience: "2 Year - 5 Years", salary: 60000, user: userId },
    { title: "Data Analyst", description: "Analyze data to support business decisions.", email: "data@gmail.com", address: "789 Pine St", company: "Data Corp", industry: ["Banking"], jobType: "Temporary", minEducation: "Masters", positions: 3, experience: "No Experience", salary: 50000, user: userId },
    { title: "Graphic Designer", description: "Design graphics for various projects.", email: "design@gmail.com", address: "321 Cedar St", company: "Creative Studio", industry: ["Education/Training"], jobType: "Internship", minEducation: "Bachelors", positions: 1, experience: "1 Year - 2 Years", salary: 40000, user: userId },
    { title: "Project Manager", description: "Manage projects and coordinate teams.", email: "pm@gmail.com", address: "654 Maple St", company: "Project Experts", industry: ["Business"], jobType: "Permanent", minEducation: "Masters", positions: 1, experience: "5 Years+", salary: 90000, user: userId }
];

// Insert mock data for 20 users and 20 jobs
const insertMockData = async () => {
    try {
        // Insert users
        const insertedUsers = await User.insertMany(users);

        // Generate jobs for each user and flatten the array
        const jobs = insertedUsers.flatMap(user => createMockJob(user._id));

        // Insert jobs
        await Job.insertMany(jobs);

        // Combine data into JSON format
        const jsonData = {
            users: insertedUsers,
            jobs: jobs
        };

        // Optionally write to a JSON file
        fs.writeFileSync("mockData.json", JSON.stringify(jsonData, null, 2), "utf-8");

        console.log("Data generated and inserted successfully:", jsonData);
    } catch (error) {
        console.error("Error inserting mock data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
};

// Run the mock data insertion function
insertMockData();
