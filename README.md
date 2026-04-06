# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# API Documentation

Base URL: `http://localhost:8000`
Authentication: JWT Bearer Token
Content-Type: application/json

## Authentication & Account

──────────────────────────────────────
Endpoint:    POST /api/register/
Description: Register a new user account
Auth:        Public
──────────────────────────────────────
Request:
  Body:
    {
    "email": "isra@gmail.com",
    "password": "isra123456",
    "confirmPassword": "isra123456",
    "role": "student",
    "fullName": "israad",
    "phone": "012345689"
    }

Response 201:
    {
    "message": "Registration successful. Please verify your email.",
    "user": {
        "id": 9,
        "email": "isra@gmail.com",
        "phone": "012345689",
        "role": "student",
        "first_name": "israad",
        "last_name": "",
        "created_at": "2026-04-05T21:53:13.893491Z",
        "email_verified": false
    },
    "tokens": {    
        "access": "<access_token>",
        "refresh": "<refresh_token>"
    }
    }

──────────────────────────────────────
Endpoint:    POST /api/login/
Description: Authenticate a user and retrieve an access token
Auth:        Public
──────────────────────────────────────
Request:
  Body:
    {
    "email": "isra@gmail.com",
    "password": "isra123456"
    }

Response 200:
    {
    "message": "Login successful",
    "user": {
        "id": 9,
        "email": "isra@gmail.com",
        "phone": "012345689",
        "role": "student",
        "first_name": "israad",
        "last_name": "",
        "created_at": "2026-04-05T21:53:13.893491Z",
        "email_verified": false
    },
    "tokens": {    
        "access": "<access_token>",
        "refresh": "<refresh_token>"
    }
    }


──────────────────────────────────────
Endpoint:    POST /api/logout/
Description: Log out the current user
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
 Body:
    {
        "refresh": "<refresh_token>"
    }

Response 200:
    {
        "message": "Logged out successfully"
    }

──────────────────────────────────────
Endpoint:    POST /api/verify-email/
Description: Verify a user's email address using a token
Auth:        Public
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
  Body:
    {
     "email": "isra@gmail.com",
  "code": "509048"
    }

Response 200:
    {
        "message": "Email verified successfully",
    "user": {
        "id": 9,
        "email": "isra@gmail.com",
        "phone": "012345689",
        "role": "student",
        "first_name": "israad",
        "last_name": "",
        "created_at": "2026-04-05T21:53:13.893491Z",
        "email_verified": true
    },
    "tokens": {    
        "access": "<access_token>",
        "refresh": "<refresh_token>"
    }
    }

──────────────────────────────────────
Endpoint:    POST /api/password-change/
Description: Change the current user's password
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
  Body:
    {
        "email": "isra@gmail.com",
    "old_password": "isra123456",
    "new_password": "israd123456",
    "confirm_password": "israd123456"
    }

Response 200:
    {
        "message": "Password changed successfully"
    }

──────────────────────────────────────
Endpoint:    POST /api/password-reset/confirm/
Description: Confirm a password reset using a reset token
Auth:        Public
──────────────────────────────────────
Request:
  Body:
    {
     "email": "isra@gmail.com",
    "code": "601306",
    "password":"israd123456",
    "confirmPassword": "israd123456"
    }

Response 200:
    {
        "message": "Password updated successfully"
    }

──────────────────────────────────────
Endpoint:    DELETE /api/delete-account/
Description: Permanently delete the current user's account
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
Body:
    {
     "email": "studd@gmail.com",
    }
Response 204:
    (No content)

──────────────────────────────────────
Endpoint:    GET /api/auth/me/
Description: Get the currently authenticated user's details
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
    "id": 5,
    "email": "iii@gmail.com",
    "role": "student",
    "first_name": "iii",
    "last_name": "",
    "phone": "0123456789",
    "email_verified": false,
    "profile": {
        "id": 4,
        "skills": [],
        "badges": [],
        "university": null,
        "domain": "Scientific",
        "speciality": "Medicine",
        "academic_year": null,
        "cv": "/media/cvs/class_diagram_HkxFjmZ.pdf",
        "profile_picture": null,
        "profile_completeness": 30,
        "wilaya": "",
        "github_url": null,
        "linkedin_url": null,
        "portfolio_url": null,
        "user": 5
    }
    }

──────────────────────────────────────
Endpoint:    POST /api/auth/webauthn/signing-options/
Description: Get WebAuthn signing options for passwordless authentication
Auth:        Public
──────────────────────────────────────
Request:
  Body:
    {
        "email": "user@example.com"
    }

Response 200:
    {
        "challenge": "<challenge_string>",
        "rpId": "localhost",
        "allowCredentials": []
    }


## Profile

──────────────────────────────────────
Endpoint:    PUT /api/profile/update/
Description: Update the current user's profile information
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
  Body:
    {
       "skills": ["react"],
        "university": "constantine",
        "speciality": "devlopment",
        "academic_year": "L3",
        "wilaya": "constantine"
    }

Response 200:
    {
         "message": "Profile updated successfully",
    "user": {
        "id": 5,
        "email": "iii@gmail.com",
        "phone": "0123456789",
        "role": "student",
        "first_name": "iii",
        "last_name": "",
        "created_at": "2026-03-28T13:40:06.693068Z",
        "email_verified": false
    }
    }


## Students

──────────────────────────────────────
Endpoint:    GET /api/students/{id}/
Description: Get a student's details by ID
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
    "id": 4,
    "first_name": "iii",
    "last_name": "",
    "email": "iii@gmail.com",
    "phone": "0123456789",
    "university": "constantine",
    "domain": "Scientific",
    "speciality": "devlopment",
    "academic_year": "L3",
    "profile_picture": null,
    "profile_completeness": 30,
    "skills": [],
    "badges": []
    }

──────────────────────────────────────
Endpoint:    GET /api/student/applications/stats
Description: Get application statistics for the current student
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
    "total": 1,
    "accepted": 1,
    "refused": 0,
    "pending": 0,
    "acceptance_rate": 100.0
    }

## Offers

──────────────────────────────────────
Endpoint:    GET /api/offers/
Description: List all available internship offers
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
            "id": 2,
        "company": 1,
        "company_name": "compname",
        "company_logo": null,
        "title": "Law Intern",
        "description": "We are looking for a law...",
        "domains": [
            {
                "id": 9,
                "name": "Computer Science"
            }
        ],
        "locations": [
            {
                "id": 1,
                "name": "oran"
            }
        ],
        "offer_types": [
            {
                "id": 1,
                "name": "Private"
            }
        ],
        "durations": [
            {
                "id": 1,
                "months": 3
            }
        ],
        "skills": [
            {
                "id": 1,
                "name": "Python"
            }
        ],
        "status": "active",
        "requirements": null,
        "salary": null,
        "is_favorite": false,
        "match_score": 0,
        "wilaya": null,
        "created_at": "2026-03-31T18:51:34.830591Z",
        "updated_at": "2026-04-03T20:03:43.356727Z"
        }
    ]

──────────────────────────────────────
Endpoint:    POST /api/offers/
Description: Create a new internship offer
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
  Body:
    {
    "title": "biology Intern",
    "description": "We are looking for a biology...",
    "domain_ids": [10],
    "location_ids": [1],
    "offer_type_ids": [1],
    "duration_ids": [1],
    "skill_ids": [3]
    }

Response 201:
    {
       "id": 5,
    "company": 1,
    "company_name": "compname",
    "company_logo": null,
    "title": "biology Intern",
    "description": "We are looking for a biology...",
    "domains": [
        {
            "id": 10,
            "name": "Biology"
        }
    ],
    "locations": [
        {
            "id": 1,
            "name": "oran"
        }
    ],
    "offer_types": [
        {
            "id": 1,
            "name": "Private"
        }
    ],
    "durations": [
        {
            "id": 1,
            "months": 3
        }
    ],
    "skills": [
        {
            "id": 3,
            "name": "Enzyme Analysis"
        }
    ],
    "status": "active",
    "requirements": null,
    "salary": null,
    "is_favorite": false,
    "match_score": 0,
    "wilaya": null,
    "created_at": "2026-04-06T13:12:17.401099Z",
    "updated_at": "2026-04-06T13:12:17.401142Z"
    }

──────────────────────────────────────
Endpoint:    GET /api/offers/mine/
Description: List offers created by the currently authenticated company
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
            "id": 1,
        "company": 1,
        "company_name": "compname",
        "company_logo": null,
        "title": "Backend Developer Intern",
        "description": "We are looking for a Django backend intern...",
        "domains": [
            {
                "id": 8,
                "name": "Law"
            }
        ],
        "locations": [
            {
                "id": 1,
                "name": "oran"
            }
        ],
        "offer_types": [
            {
                "id": 1,
                "name": "Private"
            }
        ],
        "durations": [
            {
                "id": 1,
                "months": 3
            }
        ],
        "skills": [
            {
                "id": 1,
                "name": "Python"
            }
        ],
        "status": "active",
        "requirements": "",
        "salary": null,
        "is_favorite": false,
        "match_score": 0,
        "wilaya": null,
        "created_at": "2026-03-31T18:44:07.568266Z",
        "updated_at": "2026-04-01T10:25:19.451485Z"
        }
    ]

──────────────────────────────────────
Endpoint:    GET /api/offers/options/
Description: Get available filter options for offers (domains, specialities, etc.)
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
        "domains": [...],
        "locations": [...],
        "durations": ["1 month", "3 months", ...]
        "skills":[...]
    }

──────────────────────────────────────
Endpoint:    PUT /api/offers/{id}/
Description: Update an existing internship offer
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
    Content-Type: application/json
  Body:
    {
        "title": "Updated Title",
        "description": "Updated description.",
        "duration": "1 months"
    }

Response 200:
    {
        "id": 2,
        "title": "Updated Title",
        "description": "Updated description.",
        "updated_at": "2026-01-02T00:00:00Z"
    }

──────────────────────────────────────
Endpoint:    DELETE /api/offers/{id}/
Description: Delete an internship offer
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 204:
    (No content)

──────────────────────────────────────
Endpoint:    PATCH /api/offers/{id}/status/
Description: Update the status of an offer (e.g., open, closed)
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
        "status": "active"
    }


## Favorites
──────────────────────────────────────
Endpoint:    POST /api/offers/{id}/favorite/
Description: Add an offer to the current user favorites
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 201:
    {
        "is_favorite": true
    }


──────────────────────────────────────
Endpoint:    GET /api/favorites/
Description: List all offers favorited by the current user
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
            "id": 1,
            "offer": {...},
            "created_at": "2026-01-01T00:00:00Z"
        }
    ]

## Applications

──────────────────────────────────────
Endpoint:    GET /api/applications/
Description: List all applications for the current user
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
        "id": 10,
        "student": 4,
        "student_name": "iii",
        "offer": 2,
        "company": 1,
        "status": "accepted",
        "cover_letter": null,
        "match_score": 0,
        "created_at": "2026-04-01T12:40:56.733271Z",
        "updated_at": "2026-04-01T13:07:12.587855Z"
        }
    ]

──────────────────────────────────────
Endpoint:    POST /api/applications/
Description: Submit a new application for an internship offer
Auth:        Bearer Token (Student)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
    Content-Type: application/json
  Body:
    {
          "offer": 1,
          "student": 4
    }

Response 201:
    {
    "id": 20,
    "student": 4,
    "student_name": "iii",
    "offer": 1,
    "company": 1,
    "status": "pending",
    "cover_letter": null,
    "match_score": 0,
    "created_at": "2026-04-06T18:46:27.435731Z",
    "updated_at": "2026-04-06T18:46:27.435769Z"
    }

──────────────────────────────────────
Endpoint:    GET /api/applications/{id}/
Description: Get details of a specific application
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
    "id": 17,
    "student": 4,
    "student_name": "iii",
    "offer": 5,
    "company": 1,
    "status": "pending",
    "cover_letter": null,
    "match_score": 0,
    "created_at": "2026-04-06T13:43:12.503052Z",
    "updated_at": "2026-04-06T13:43:12.503085Z"
    }

──────────────────────────────────────
Endpoint:    GET /api/applications/offer/{offerId}
Description: List all applications submitted for a specific offer
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
 {
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {...},
        {...}
    ]
}

──────────────────────────────────────
Endpoint:    POST /api/applications/{id}/accept/
Description: Accept a student's application
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
       "message": "Application accepted"
    }

──────────────────────────────────────
Endpoint:    POST /api/applications/{id}/refuse/
Description: Refuse a student's application
Auth:        Bearer Token (Company)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
        "message": "Application refused"
    }

──────────────────────────────────────
Endpoint:    PATCH /api/applications/{id}/cancel/
Description: Cancel a submitted application
Auth:        Bearer Token (Student)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
       "message": "Application cancelled successfully."
    }

──────────────────────────────────────
Endpoint:    POST /api/applications/{id}/generate-convention/
Description: Generate a convention/internship agreement document for an accepted application
Auth:        Bearer Token
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 201:
    {
          "id": 9,
    "student": 4,
    "student_details": {
        "id": 4,
        "first_name": "iii",
        "last_name": "",
        "domain": "Scientific",
        "speciality": "devlopment"
    },
    "offer": 1,
    "offer_details": {
        "id": 1,
        "title": "Backend Developer Intern"
    },
    "company": 1,
    "company_details": {
        "id": 1,
        "company_name": "compname"
    },
    "status": "pending_student_signature",
    "start_date": "2026-04-06",
    "end_date": "2026-07-05",
    "pdf_file": "/media/conventions/convention_9.pdf",
    "created_at": "2026-04-06T19:15:04.834134Z",
    "updated_at": "2026-04-06T19:15:04.916813Z"
    }

## Admin

──────────────────────────────────────
Endpoint:    GET /api/admin/dashboard/
Description: Get admin dashboard statistics
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
    "users": {
        "total": 8,
        "students": 6,
        "companies": 1
    },
    "offers": {
        "total": 4,
        "active": 4
    },
    "applications": {
        "total": 7,
        "accepted": 5
    },
    "validations": {
        "pending": 1
    }
    }

──────────────────────────────────────
Endpoint:    GET /api/admin/companies/
Description: List all registered companies
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
        "id": 1,
        "email": "comp@company.com",
        "company_name": "compname",
        "industry": null,
        "verification_status": "accepted",
        "is_active": true
        }
    ]

──────────────────────────────────────
Endpoint:    PATCH /api/admin/companies/{id}/verify/
Description: Verify or unverify a company account
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
      "verification_status": "accepted"
    }

──────────────────────────────────────
Endpoint:    GET /api/admin/documents/
Description: List all uploaded documents
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
        "id": 1,
        "internship_title": "Law Intern",
        "start_date": "2026-04-01",
        "end_date": "2026-06-30",
        "duration_months": 3,
        "supervisor_name": "To Be Defined",
        "supervisor_email": "comp@company.com",
        "tasks": {
            "description": "We are looking for a Django backend intern...",
            "requirements": null
        },
        "compensation": "Unpaid",
        "compensation_amount": "0.00",
        "status": "pending_student_signature",
        "student_signed": false,
        "student_signed_at": null,
        "student_fingerprint_authenticated": false,
        "student_authentication_timestamp": "",
        "student_credential_id": "",
        "student_ip_address": null,
        "student_user_agent": "",
        "company_signed": false,
        "company_signed_at": null,
        "company_fingerprint_authenticated": false,
        "company_authentication_timestamp": "",
        "company_credential_id": "",
        "company_ip_address": null,
        "company_user_agent": "",
        "admin_signed": false,
        "admin_signed_at": null,
        "admin_fingerprint_authenticated": false,
        "admin_authentication_timestamp": "",
        "admin_credential_id": "",
        "admin_ip_address": null,
        "admin_user_agent": "",
        "pdf_file": "http://localhost:8000/media/conventions/convention_1.pdf",
        "pdf_generated_at": "2026-04-01T12:59:59.362718Z",
        "verification_code": "66d1194171394e248299864ed5cc6c91",
        "rejection_reason": null,
        "rejected_at": null,
        "created_at": "2026-04-01T12:59:59.282491Z",
        "updated_at": "2026-04-01T12:59:59.363036Z",
        "application": 10,
        "student": 4,
        "company": 1,
        "offer": 2,
        "admin_signed_by": null,
        "rejected_by": null
        }
    ]

──────────────────────────────────────
Endpoint:    GET /api/admin/validations/
Description: List all pending internship validations
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    [
        {
        "id": 3,
        "application": {
            "id": 15,
            "student": {
                "id": 2,
                "email": "student@gmail.com",
                "first_name": "studentfullname",
                "last_name": "",
                "is_active": true,
                "domain": "biology",
                "speciality": "Ecology",
                "university": null
            },
            "offer": {
                "id": 1,
                "title": "Backend Developer Intern",
                "company_name": "compname",
                "domains": [
                    "Law"
                ],
                "offer_types": [
                    "Private"
                ],
                "status": "active"
            },
            "status": "pending",
            "created_at": "2026-04-03T10:53:04.104999Z"
        },
        "status": "pending",
        "validated_by": null,
        "created_at": "2026-04-03T10:53:04.115237Z",
        "updated_at": "2026-04-03T10:53:04.115286Z"
        }
    ]

──────────────────────────────────────
Endpoint:    POST /api/admin/validations/{id}/approve/
Description: Approve a validation request
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
       "message": "Validation approved and convention auto-generated successfully."
    }

──────────────────────────────────────
Endpoint:    POST /api/admin/validations/{id}/reject/
Description: Reject a validation request
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
  Body:
    {    
       "feedback": "anything reason"
    }

Response 200:
    {
     "message": "Validation rejected successfully."
    }


──────────────────────────────────────
Endpoint:    POST /api/verify/portfolio/{id}/submit/
Description: Submit a student portfolio for admin verification
Auth:        Bearer Token (Student)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
 Body:
    {
       "portfolio_url": "https://github.com/myname/myproject"
    }
Response 200:
    {
           "id": 3,
    "student": 4,
    "competency": 3,
    "portfolio_url": "https://github.com/myname/myproject",
    "status": "pending",
    "feedback": null,
    "submitted_at": "2026-04-06T16:13:26.983385Z",
    "reviewed_at": null
    }


──────────────────────────────────────
Endpoint:    POST /api/admin/portfolio/{id}/review/
Description: Submit a review decision on a student's portfolio
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>
    Content-Type: application/json
  Body:
    {
        "status": "approved",
        "feedback": "Portfolio looks great."
    }

Response 200:
    {
        "message": "Portfolio submission approved successfully."
    }

──────────────────────────────────────
Endpoint:    PATCH /api/admin/users/{id}/status/
Description: Activate or deactivate a user account
Auth:        Admin only (Bearer Token)
──────────────────────────────────────
Request:
  Headers:
    Authorization: Bearer <token>

Response 200:
    {
       "is_active": true  
    }
