# PACTA API Documentation

## Overview

This document provides detailed information about the PACTA API endpoints, request/response formats, and authentication methods.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) authentication. To access protected endpoints, you need to include an Authorization header with a valid token.

```
Authorization: Bearer <your_token>
```

### Getting a Token

To get a token, you need to authenticate using the login endpoint.

## Endpoints

### Authentication

#### Register User

- **URL**: `/users/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "YourSecurePassword123!",
    "confirmPassword": "YourSecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "1234567890"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "emailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Login

- **URL**: `/users/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "YourSecurePassword123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "user": {
        "id": "uuid-here",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "status": "active",
        "emailVerified": true
      },
      "accessToken": "your-access-token",
      "refreshToken": "your-refresh-token"
    }
  }
  ```

#### Refresh Token

- **URL**: `/users/refresh-token`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token"
    }
  }
  ```

#### Password Reset Request

- **URL**: `/users/password-reset`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Password reset instructions sent to email"
  }
  ```

#### Reset Password

- **URL**: `/users/password-reset/:token`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "newPassword": "YourNewSecurePassword123!",
    "confirmPassword": "YourNewSecurePassword123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Password reset successfully"
  }
  ```

#### Email Verification

- **URL**: `/users/email-verification/:token`
- **Method**: `GET`
- **Authentication**: None
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Email verified successfully"
  }
  ```

### User Management

#### Get Current User Profile

- **URL**: `/users/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Profile retrieved successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "phoneNumber": "1234567890",
      "profilePicture": "https://example.com/profile.jpg",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
      },
      "preferences": {},
      "emailVerified": true,
      "lastLogin": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Update User Profile

- **URL**: `/users/profile`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "9876543210",
    "address": {
      "street": "456 New St",
      "city": "Newtown",
      "state": "NY",
      "zipCode": "54321",
      "country": "USA"
    },
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "user",
      "status": "active",
      "phoneNumber": "9876543210",
      "profilePicture": "https://example.com/profile.jpg",
      "address": {
        "street": "456 New St",
        "city": "Newtown",
        "state": "NY",
        "zipCode": "54321",
        "country": "USA"
      },
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "emailVerified": true,
      "lastLogin": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Admin User Management

These endpoints require admin privileges.

#### Get All Users

- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sortBy`: Field to sort by (default: createdAt)
  - `sortOrder`: Sort order (asc or desc, default: desc)
  - `status`: Filter by status (active, inactive, suspended)
  - `role`: Filter by role (admin, user, moderator)
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Users retrieved successfully",
    "data": [
      {
        "id": "uuid-1",
        "email": "user1@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "status": "active",
        "emailVerified": true,
        "lastLogin": "2023-01-01T00:00:00.000Z",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": "uuid-2",
        "email": "user2@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "moderator",
        "status": "active",
        "emailVerified": true,
        "lastLogin": "2023-01-01T00:00:00.000Z",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
  ```

#### Get User by ID

- **URL**: `/users/:id`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "User retrieved successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "phoneNumber": "1234567890",
      "profilePicture": "https://example.com/profile.jpg",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
      },
      "preferences": {},
      "emailVerified": true,
      "lastLogin": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Create User (Admin)

- **URL**: `/users`
- **Method**: `POST`
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "firstName": "New",
    "lastName": "User",
    "role": "user",
    "status": "active",
    "phoneNumber": "1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    }
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "data": {
      "id": "uuid-here",
      "email": "newuser@example.com",
      "firstName": "New",
      "lastName": "User",
      "role": "user",
      "status": "active",
      "phoneNumber": "1234567890",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
      },
      "emailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Update User (Admin)

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "firstName": "Updated",
    "lastName": "User",
    "role": "moderator",
    "status": "active",
    "emailVerified": true
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "User updated successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "Updated",
      "lastName": "User",
      "role": "moderator",
      "status": "active",
      "emailVerified": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Delete User

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Admin only)
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "User deleted successfully"
  }
  ```

#### Update User Status

- **URL**: `/users/:userId/status`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "status": "inactive"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "User status updated successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "inactive",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Update User Role

- **URL**: `/users/:userId/role`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "role": "moderator"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "User role updated successfully",
    "data": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "moderator",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### Get Active Users

- **URL**: `/users/active`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "message": "Active users retrieved successfully",
    "data": [
      {
        "id": "uuid-1",
        "email": "user1@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "status": "active",
        "emailVerified": true,
        "lastLogin": "2023-01-01T00:00:00.000Z",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

## Error Responses

### 400 Bad Request

```json
{
  "status": "fail",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "status": "fail",
  "code": "AUTHENTICATION_ERROR",
  "message": "Authentication failed"
}
```

### 403 Forbidden

```json
{
  "status": "fail",
  "code": "AUTHORIZATION_ERROR",
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found

```json
{
  "status": "fail",
  "code": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 409 Conflict

```json
{
  "status": "fail",
  "code": "CONFLICT",
  "message": "Email already registered"
}
```

### 429 Too Many Requests

```json
{
  "status": "fail",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Something went wrong!"
}
```
