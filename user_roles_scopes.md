# User Roles and Scopes

This document outlines the various user roles available in the system and their respective access scopes and permissions.

## Overview of Roles

The system is configured with five distinct primary hierarchical scopes. Several internal roles are grouped into these unified access scopes:

1. **Admin** (`admin`)
2. **CEO / Leadership** (`leadership`, `ceo_haca`)
3. **Academic / SSHO** (`academic`, `ssho`, `pl`) 
4. **SHO (Student Happiness Officer)** (`sho`)
5. **Mentor** (`mentor`)

---

## Access Scopes by Role Group

### 1. Admin (`admin`)
Administrators have the highest level of access across the platform, including true system-level configuration if any. They share the same top-level access scopes as CEO/Leadership.
* **Exclusive Access**: `User Management`, `Audit Logs`, `Sync Sales Data`
* **Global Access**: `Schools`, `Notifications`
* **Standard Access**: Dashboard, Batches, Students, Tasks/Assignments, Feedback, Planner, Analytics, and Settings.
* **Restricted**: Cannot access `Attendance` (restricted exclusively for SHO).

### 2. CEO / Leadership (`ceo_haca`, `leadership`)
This level contains executive and highest-level overview roles, aligned exactly with the scopes granted to Administrators.
* **Exclusive Access**: `User Management`, `Audit Logs`, `Sync Sales Data`
* **Global Access**: `Schools`, `Notifications`
* **Standard Access**: Dashboard, Batches, Students, Tasks/Assignments, Feedback, Planner, Analytics, and Settings.
* **Restricted**: Cannot access `Attendance`.

### 3. Academic / SSHO / Project Lead (`academic`, `ssho`, `pl`)
These roles operate jointly as a single aligned scope. They oversee academic operations, partner schools, projects, and senior happiness logistics but do not control direct administrative configurations.
* **Restricted Global Access**: 
  * `Schools` (Can only view their **Assigned Partner Institutions**, not the global list)
  * `Notifications` (Inbox & sending notices)
* **Standard Access**: Dashboard, Batches, Students, Tasks/Assignments, Feedback, Planner, Analytics, and Settings.
* **Restricted**: Cannot access `Users`, `Audit Logs`, or `Attendance`.

### 4. SHO (Student Happiness Officer) (`sho`)
The SHO role is heavily focused on daily student interactions, tracking participation, and managing attendance on the ground.
* **Exclusive Access**: 
  * `Attendance` (Mark and track attendance logs)
* **Global Access**: 
  * `Notifications` (Inbox & sending notices to groups/batches)
* **Standard Access**: Dashboard (Shows assigned batches), Batches, Students, Tasks/Assignments, Feedback, Planner, Analytics, and Settings.
* **Restricted**: Cannot access `Schools`, `Users`, or `Audit Logs`.

### 5. Mentor (`mentor`)
Mentors guide students and monitor performance and feedback for assigned cohorts.
* **Global Access**: 
  * `Schools` (Partner institutions)
  * `Notifications` (Inbox access)
* **Standard Access**: Dashboard (Shows assigned batches instead of total batches), Batches, Students, Tasks/Assignments, Feedback, Planner, Analytics, and Settings.
* **Restricted**: Cannot access `Users`, `Audit Logs`, or `Attendance`.

---

## Route-Level Breakdown

| Route / Feature | Admin | CEO / Leadership | Academic / SSHO | Mentor | SHO |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Batches** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Students** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Assignments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Feedback** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Analytics** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Class Planner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Settings** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Schools** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Attendance** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Users** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | ✅ | ❌ | ❌ | ❌ |

> **Note**: Routes left unchecked (❌) are protected by navigation guards (`ProtectedRoute`) that will redirect unauthorized roles to their default permitted pages (e.g. `Dashboard`).
