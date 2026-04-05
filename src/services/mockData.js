export const mockUserData = {
    first_name: "Ahmed",
    last_name: "Benali",
    email: "ahmed.benali@example.com",
    profile: {
        id: 1,
        speciality: "Software Engineering",
        profile_picture: null,
        applications_sent: 5,
        offers_received: 2,
        favorite_offers_count: 3,
        profile_completeness: 85,
    }
};

export const mockApplications = [
    {
        id: 1,
        company_name: "Sonatrach",
        company_location: "Algiers",
        offer_title: "Reservoir Engineer - PFE Internship",
        created_at: "2024-03-14T10:00:00Z",
        status: "accepted",
        offer: 101,
        tags: ["GEOSCIENCES", "PFE", "4 MONTHS"],
        cover_letter_snippet: "Passionate about energy...",
        alerts: [
            { type: "success", text: "Congratulations! Your profile has been selected." },
            { type: "info", text: "Your agreement is ready for signature." },
        ],
        theme_color: "#ff1b90" // The icon is pink background with factory
    },
    {
        id: 2,
        company_name: "Ooredoo",
        company_location: "Setif",
        offer_title: "Digital Marketing",
        created_at: "2024-04-05T14:30:00Z",
        status: "pending",
        offer: 102,
        tags: ["COMMUNICATION", "SUMMER INTERNSHIP", "2 MONTHS"],
        cover_letter_snippet: "",
        alerts: [],
        theme_color: "#ff7b00" // Orange icon
    },
    {
        id: 3,
        company_name: "Air Algérie",
        company_location: "Algiers",
        offer_title: "Aeronautical Maintenance",
        created_at: "2024-04-01T09:15:00Z",
        status: "under review",
        offer: 103,
        tags: ["TECHNICAL", "SUMMER INTERNSHIP", "3 MONTHS"],
        cover_letter_snippet: "",
        alerts: [],
        theme_color: "#3b82f6" // Blue icon
    },
    {
        id: 4,
        company_name: "Mobilis",
        company_location: "Oran",
        offer_title: "Fullstack Developer",
        created_at: "2024-03-20T10:00:00Z",
        status: "rejected",
        offer: 104,
        tags: ["IT", "PFE", "6 MONTHS"],
        cover_letter_snippet: "",
        alerts: [],
        rejection_message: "We thank you for the interest shown in Mobilis. Unfortunately, we were not able to proceed with your application at this time...",
        theme_color: "#10b981" // Green icon
    }
];

export const mockRecommendations = [
    {
        id: 101,
        company_name: "Sonatrach",
        company_logo: null,
        title: "Reservoir Engineer - PFE Internship",
        offer_types: [{ name: "PFE" }, { name: "Présentiel" }],
        durations: [{ months: 4 }],
        wilaya: "Algiers",
        created_at: "2024-03-10T08:00:00Z",
        updated_at: "2024-03-12T06:00:00Z",
        salary: "Indemnité à négocier",
        match_score: 94,
        is_favorite: true,
        contract_type: "Internship",
        description: `Join Sonatrach as a Reservoir Engineering Intern and play a crucial role in optimizing hydrocarbon recovery. You will work alongside our senior geology and engineering teams to analyze well test data, run flow simulations, and propose strategies for maximizing field output.<br/><br/><ul><li>Analyze pressure transient test data.</li><li>Build and history-match 3D reservoir simulation models.</li><li>Collaborate with multidisciplinary teams for field development planning.</li></ul>`,
        domains: [{ name: "Geosciences" }, { name: "Energy" }],
        skills: [{ name: "PETREL" }, { name: "ECLIPSE" }, { name: "DATA ANALYSIS" }],
        requirements: {
            "Education": { desc: "Final year Engineering student in Geosciences or Petroleum Engineering." },
            "Technical": { desc: "Familiarity with reservoir simulation software." }
        },
        summary: {
            department: "Reservoir Engineering",
            level: "Intern",
            industry: "Oil & Gas",
            work_model: "On-site"
        }
    },
    {
        id: 102,
        company_name: "Ooredoo",
        company_logo: null,
        title: "Digital Marketing",
        offer_types: [{ name: "Summer Internship" }],
        durations: [{ months: 2 }],
        wilaya: "Setif",
        created_at: "2024-04-01T11:20:00Z",
        updated_at: "2024-04-02T11:20:00Z",
        salary: "Non rémunéré",
        match_score: 85,
        is_favorite: false,
        contract_type: "Internship",
        description: "Join the digital transformation! We are looking for a dynamic marketing intern to help manage our social media presence, craft creative campaigns, and analyze user engagement data for the summer.",
        domains: [{ name: "Communication" }, { name: "Marketing" }],
        skills: [{ name: "SOCIAL MEDIA" }, { name: "SEO" }, { name: "CONTENT CREATION" }],
        requirements: {}
    },
    {
        id: 103,
        company_name: "Air Algérie",
        company_logo: null,
        title: "Aeronautical Maintenance",
        offer_types: [{ name: "Summer Internship" }],
        durations: [{ months: 3 }],
        wilaya: "Algiers",
        created_at: "2024-03-25T16:45:00Z",
        updated_at: "2024-03-26T17:45:00Z",
        salary: "Stage conventionné",
        match_score: 88,
        is_favorite: false,
        contract_type: "Internship",
        description: "Hands-on experience in our central maintenance hangar. You will shadow certified mechanics and learn the protocols of maintaining commercial aircraft systems.",
        domains: [{ name: "Aeronautics" }, { name: "Maintenance" }],
        skills: [{ name: "MECHANICS" }, { name: "SAFETY PROTOCOLS" }],
        requirements: {}
    },
    {
        id: 104,
        company_name: "Mobilis",
        company_logo: null,
        title: "Fullstack Developer",
        offer_types: [{ name: "PFE" }],
        durations: [{ months: 6 }],
        wilaya: "Oran",
        created_at: "2024-02-15T09:00:00Z",
        updated_at: "2024-02-20T10:00:00Z",
        salary: "Paid Internship",
        match_score: 92,
        is_favorite: false,
        contract_type: "Internship",
        description: "We are developing a new internal dashboard for managing network loads. As a Fullstack Developer intern, you will build the frontend using React and the backend with Node.js/Express.",
        domains: [{ name: "IT" }, { name: "Software Engineering" }],
        skills: [{ name: "REACT" }, { name: "NODE.JS" }, { name: "MONGODB" }],
        requirements: {}
    },
    {
        id: 105,
        company_name: "Cyberdyne Systems",
        company_logo: null,
        title: "Senior Principal Cloud Architect",
        offer_types: [{ name: "CDI" }],
        durations: [{ months: 12 }],
        wilaya: "Algiers",
        created_at: "2024-04-10T11:20:00Z",
        updated_at: "2024-04-11T11:20:00Z",
        salary: "To be negotiated",
        match_score: 95,
        is_favorite: true,
        contract_type: "Full-time",
        description: "Securing the future of decentralized computing.",
        domains: [{ name: "Infrastructure" }],
        skills: [{ name: "AWS" }, { name: "KUBERNETES" }],
        requirements: {}
    }
];

export const mockMatchBreakdown = {
    breakdown: {
        speciality: 1.0,
        skills: 0.8,
        challenges: 0.9,
        location: 1.0
    },
    weights: {
        speciality: 40,
        skills: 30,
        challenges: 20,
        location: 10
    }
};
