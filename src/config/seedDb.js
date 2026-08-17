const bcrypt = require('bcryptjs');
const {
  User,
  StudentProfile,
  Analytics,
  Course,
  Lecture,
  Assessment,
  CodingProblem,
  Company,
  Achievement,
  Notification
} = require('../models');

async function seedDatabase() {
  try {
    // 1. Seed Demo Users if no users exist
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🌱 Seeding initial demo users into MySQL...');
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Student Rahul Sharma
      const student1 = await User.create({
        name: 'Rahul Sharma',
        email: 'student@demo.com',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        batch: '2025',
        streak: 5,
        skillPoints: 2840,
        lastActive: new Date().toISOString().split('T')[0]
      });
      await StudentProfile.create({ userId: student1.id, branch: 'Computer Science and Engineering' });
      await Analytics.create({ userId: student1.id, attendance: 92.5, internalMarks: 88 });

      // Student Priya Verma
      const student2 = await User.create({
        name: 'Priya Verma',
        email: 'priya@demo.com',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        batch: '2025',
        streak: 7,
        skillPoints: 3120,
        lastActive: new Date().toISOString().split('T')[0]
      });
      await StudentProfile.create({ userId: student2.id, branch: 'Computer Science and Engineering' });
      await Analytics.create({ userId: student2.id, attendance: 96.0, internalMarks: 94 });

      // Student Amit Kumar
      const student3 = await User.create({
        name: 'Amit Kumar',
        email: 'amit@demo.com',
        password: hashedPassword,
        role: 'student',
        department: 'ECE',
        batch: '2025',
        streak: 3,
        skillPoints: 2450,
        lastActive: new Date().toISOString().split('T')[0]
      });
      await StudentProfile.create({ userId: student3.id, branch: 'Electronics and Communication' });
      await Analytics.create({ userId: student3.id, attendance: 89.0, internalMarks: 82 });

      // Faculty Dr. Rajesh Sharma
      await User.create({
        name: 'Dr. Rajesh Sharma',
        email: 'faculty@demo.com',
        password: hashedPassword,
        role: 'faculty',
        department: 'CSE',
        streak: 12,
        skillPoints: 5000,
        lastActive: new Date().toISOString().split('T')[0]
      });

      // Admin
      await User.create({
        name: 'Admin User',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
        department: 'CSE',
        streak: 1,
        skillPoints: 10000,
        lastActive: new Date().toISOString().split('T')[0]
      });

      // Seed sample badges and notifications for student1
      await Achievement.create({
        userId: student1.id,
        type: 'badge',
        title: 'DSA Master',
        description: 'Completed 50+ DSA algorithmic problems',
        metadata: { icon: '🏆', rarity: 'Rare' }
      });
      await Achievement.create({
        userId: student1.id,
        type: 'streak',
        title: '5-Day Streak',
        description: 'Consistent learning for 5 consecutive days',
        metadata: { icon: '🔥', days: 5 }
      });
      await Notification.create({
        userId: student1.id,
        message: 'Welcome to PlacePrep! TCS Campus Drive test has been scheduled.',
        read: false
      });
      console.log('✅ Users seeded successfully.');
    }

    // 2. Seed Video Lectures
    const lectureCount = await Lecture.count();
    if (lectureCount === 0) {
      console.log('🌱 Seeding video lectures library into MySQL...');
      const sampleLectures = [
        {
          id: 'lec-1',
          title: 'Complete Guide to Dynamic Programming & Memoization',
          subject: 'DAA',
          faculty: 'Dr. Rajesh Sharma (Head of CSE)',
          date: '2026-08-05',
          duration: '45 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
          description: 'Master 1D and 2D DP patterns including 0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication with live code walkthroughs.',
          tags: ['DP', 'DAA', 'Algorithms', 'Optimization']
        },
        {
          id: 'lec-2',
          title: 'Advanced Graph Theory: Tarjan, Kosaraju & Shortest Paths',
          subject: 'DSA',
          faculty: 'Prof. Ananya Gupta',
          date: '2026-08-04',
          duration: '52 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
          description: 'Deep dive into Strongly Connected Components (SCC), Topological Sorting, Articulation Points, and Bridges for product-based company rounds.',
          tags: ['Graphs', 'DSA', 'Algorithms', 'Placement']
        },
        {
          id: 'lec-3',
          title: 'Mastering System Design & Distributed Microservices',
          subject: 'System Design',
          faculty: 'Dr. Rajesh Sharma (Head of CSE)',
          date: '2026-08-02',
          duration: '60 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          description: 'High Availability, Load Balancing, Consistent Hashing, Rate Limiting, and Microservices Architecture for SDE-2 interviews.',
          tags: ['System Design', 'Placement Prep', 'Architecture']
        },
        {
          id: 'lec-4',
          title: 'Database Transactions, ACID & B-Tree Indexing in MySQL',
          subject: 'DBMS',
          faculty: 'Prof. S. Srinath',
          date: '2026-08-01',
          duration: '38 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
          description: 'Understanding concurrency control, MVCC, write-ahead logging, and indexing optimization in relational database engines.',
          tags: ['DBMS', 'SQL', 'MySQL', 'Transactions']
        },
        {
          id: 'lec-5',
          title: 'Operating Systems: Concurrency, Mutex, Semaphores & Deadlocks',
          subject: 'OS',
          faculty: 'Prof. Chester Rebeiro',
          date: '2026-07-28',
          duration: '42 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
          description: 'In-depth breakdown of process synchronization, thread safety, dining philosophers problem, and deadlock avoidance algorithms.',
          tags: ['OS', 'Concurrency', 'Systems']
        }
      ];

      for (const lec of sampleLectures) {
        await Lecture.create(lec);
      }
      console.log('✅ Video lectures seeded successfully.');
    }

    // 3. Seed Courses
    const courseCount = await Course.count();
    if (courseCount === 0) {
      console.log('🌱 Seeding courses into MySQL...');
      const sampleCourses = [
        {
          title: 'Data Structures & Algorithms',
          description: 'Master Arrays, Trees, Graphs, DP, Sorting & Searching with 150+ interview-tested problems.',
          modules: [
            { title: 'Arrays & Strings', duration: '6 hours' },
            { title: 'Trees & BST', duration: '8 hours' },
            { title: 'Graphs & Shortest Path', duration: '10 hours' },
            { title: 'Dynamic Programming', duration: '12 hours' }
          ],
          videos: [
            { title: 'DSA Overview', url: 'https://www.youtube.com/playlist?list=PLEVDNf8eGO3S5Ao3MjnUBJ0mEDcn-N36l' }
          ],
          notes: ['https://nptel.ac.in/courses/106102064'],
          quizzes: ['dsa-assessment-1']
        },
        {
          title: 'Database Management Systems & SQL',
          description: 'SQL, Normalization, Transactions, ACID properties, Indexing and Query Optimization.',
          modules: [
            { title: 'ER & Relational Model', duration: '5 hours' },
            { title: 'Advanced SQL Queries', duration: '8 hours' },
            { title: 'Transactions & Concurrency', duration: '7 hours' }
          ],
          videos: [
            { title: 'DBMS Masterclass', url: 'https://www.youtube.com/playlist?list=PL9ooVrP1hQOHG6HpyZ6lFNFm5vEsG5Lg1' }
          ],
          notes: ['https://nptel.ac.in/courses/106105175'],
          quizzes: ['dbms-assessment-1']
        },
        {
          title: 'Full Stack Web Development (MERN/PERN)',
          description: 'React, Node.js, Databases, REST APIs — build scalable, production-grade web applications.',
          modules: [
            { title: 'Modern React & State Management', duration: '12 hours' },
            { title: 'Node.js & Express REST APIs', duration: '10 hours' },
            { title: 'SQL & Database Architecture', duration: '8 hours' }
          ],
          videos: [],
          notes: [],
          quizzes: []
        },
        {
          title: 'Operating Systems & Linux Internals',
          description: 'Processes, Memory Management, File Systems, CPU Scheduling, and Shell Scripting.',
          modules: [
            { title: 'Process Management & Threads', duration: '8 hours' },
            { title: 'Virtual Memory & Paging', duration: '7 hours' }
          ],
          videos: [],
          notes: [],
          quizzes: []
        }
      ];

      for (const crs of sampleCourses) {
        await Course.create(crs);
      }
      console.log('✅ Courses seeded successfully.');
    }

    // 4. Seed Assessments & Quizzes
    const assessmentCount = await Assessment.count();
    if (assessmentCount === 0) {
      console.log('🌱 Seeding assessments and quizzes into MySQL...');
      await Assessment.create({
        title: 'DSA & Technical Placement Assessment',
        type: 'mcq',
        totalScore: 5,
        questions: [
          {
            id: 1,
            question_text: 'What is the time complexity of binary search in a sorted array of size n?',
            options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
            correct_answer: 'O(log n)',
            explanation: 'Binary search halves the search space each time, giving O(log n) complexity.',
            marks: 1,
          },
          {
            id: 2,
            question_text: 'Which data structure uses LIFO principle?',
            options: ['Queue', 'Array', 'Stack', 'Linked List'],
            correct_answer: 'Stack',
            explanation: 'A Stack follows Last-In-First-Out (LIFO) — the last element pushed is the first to be popped.',
            marks: 1,
          },
          {
            id: 3,
            question_text: 'What does SQL stand for?',
            options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Logic', 'Standard Query Listing'],
            correct_answer: 'Structured Query Language',
            explanation: 'SQL stands for Structured Query Language, used to manage relational databases.',
            marks: 1,
          },
          {
            id: 4,
            question_text: 'Which of the following is NOT an OOP pillar in Java/C++?',
            options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'],
            correct_answer: 'Compilation',
            explanation: 'OOP features are Encapsulation, Polymorphism, Inheritance, and Abstraction.',
            marks: 1,
          },
          {
            id: 5,
            question_text: 'Which OSI layer handles IP routing and logical addressing?',
            options: ['Data Link', 'Network', 'Transport', 'Session'],
            correct_answer: 'Network',
            explanation: 'The Network Layer (Layer 3) handles logical addressing and routing between networks.',
            marks: 1,
          }
        ]
      });

      await Assessment.create({
        title: 'NPTEL & Aptitude Mock Assessment',
        type: 'mcq',
        totalScore: 3,
        questions: [
          {
            id: 1,
            question_text: 'In a train moving at 60 km/h, what distance is covered in 30 minutes?',
            options: ['20 km', '25 km', '30 km', '35 km'],
            correct_answer: '30 km',
            marks: 1
          },
          {
            id: 2,
            question_text: 'Which graph algorithm finds single source shortest paths with non-negative weights?',
            options: ['Dijkstra', 'Floyd-Warshall', 'Kruskal', 'Prim'],
            correct_answer: 'Dijkstra',
            marks: 1
          },
          {
            id: 3,
            question_text: 'What is the default isolation level in MySQL InnoDB?',
            options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
            correct_answer: 'REPEATABLE READ',
            marks: 1
          }
        ]
      });
      console.log('✅ Assessments seeded successfully.');
    }

    // 5. Seed Coding Problems
    const problemCount = await CodingProblem.count();
    if (problemCount === 0) {
      console.log('🌱 Seeding coding problems into MySQL...');
      const problems = [
        {
          title: 'Two Sum',
          statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'easy',
          tags: ['Array', 'Hash Table'],
          testCases: [
            { input: '[2,7,11,15], target = 9', output: '[0,1]' },
            { input: '[3,2,4], target = 6', output: '[1,2]' }
          ]
        },
        {
          title: 'Reverse a Linked List',
          statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
          difficulty: 'easy',
          tags: ['Linked List', 'Recursion'],
          testCases: [
            { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]' }
          ]
        },
        {
          title: 'Longest Substring Without Repeating Characters',
          statement: 'Given a string s, find the length of the longest substring without duplicate characters.',
          difficulty: 'medium',
          tags: ['Hash Table', 'Sliding Window', 'String'],
          testCases: [
            { input: '"abcabcbb"', output: '3' },
            { input: '"bbbbb"', output: '1' }
          ]
        },
        {
          title: 'LRU Cache Design',
          statement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get and put in O(1) time.',
          difficulty: 'hard',
          tags: ['Design', 'Hash Table', 'Doubly Linked List'],
          testCases: [
            { input: 'capacity = 2, put(1,1), put(2,2), get(1)', output: '1' }
          ]
        }
      ];

      for (const p of problems) {
        await CodingProblem.create(p);
      }
      console.log('✅ Coding problems seeded successfully.');
    }

    // 6. Seed Companies
    const companyCount = await Company.count();
    if (companyCount === 0) {
      console.log('🌱 Seeding companies into MySQL...');
      const companies = [
        {
          name: 'TCS (Tata Consultancy Services)',
          profile: 'Leading global IT services, consulting, and business solutions organization.',
          eligibility: '60% throughout academics in 10th, 12th, and B.Tech',
          jobRoles: ['Ninja Developer', 'Digital Specialist', 'Prime Innovator']
        },
        {
          name: 'Infosys',
          profile: 'Global leader in next-generation digital services and consulting.',
          eligibility: '65% / 6.5 CGPA with no active backlogs',
          jobRoles: ['Systems Engineer', 'Specialist Programmer', 'Digital Specialist Engineer']
        },
        {
          name: 'Wipro',
          profile: 'Leading technology services and consulting company focused on building innovative solutions.',
          eligibility: '60% throughout academics',
          jobRoles: ['Project Engineer', 'Turbo Specialist']
        },
        {
          name: 'Amazon',
          profile: 'Multinational technology company focusing on e-commerce, cloud computing, online advertising, and AI.',
          eligibility: '7.0+ CGPA in B.Tech Computer Science / IT / Circuit branches',
          jobRoles: ['Software Development Engineer (SDE-1)', 'Quality Assurance Engineer', 'Cloud Support Associate']
        },
        {
          name: 'Google',
          profile: 'Technology leader specializing in search engine technology, cloud computing, and AI systems.',
          eligibility: 'Strong DSA, Problem Solving & System Architecture competence',
          jobRoles: ['Software Engineer (SWE)', 'Application Engineer']
        },
        {
          name: 'Microsoft',
          profile: 'World leader in software products, cloud platforms, and personal computing.',
          eligibility: '7.5+ CGPA with strong algorithmic foundation',
          jobRoles: ['Software Engineer', 'Support Engineer']
        }
      ];

      for (const c of companies) {
        await Company.create(c);
      }
      console.log('✅ Companies seeded successfully.');
    }

  } catch (error) {
    console.error('❌ Error seeding MySQL database:', error.message);
  }
}

module.exports = seedDatabase;
