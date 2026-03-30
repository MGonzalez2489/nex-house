# Database Design Document

This document is auto-generated. Do not edit manually.

### Entity Relationship Diagram

```mermaid
erDiagram
    Neighborhood {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        string name
        string slug
        text address
        enum status
    }
    Neighborhood ||--|{ HousingUnit : "units"
    User {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        string email
        string password
        string firstName
        string lastName
        string phone
        enum role
        number neighborhoodId
        enum status
    }
    User }|--|| Neighborhood : "neighborhood"
    User ||--|{ UnitAssignment : "assignments"
    UnitAssignment {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        number unitId
        number userId
        boolean isActive
        boolean isOwner
        boolean isTenant
        boolean isFamily
    }
    UnitAssignment }|--|| HousingUnit : "unit"
    UnitAssignment }|--|| User : "user"
    HousingUnit {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        string identifier
        string streetName
        enum status
        enum type
        number neighborhoodId
    }
    HousingUnit }|--|| Neighborhood : "neighborhood"
    HousingUnit ||--|{ UnitAssignment : "assignments"
    Payment {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        number unitId
        int amount
        string evidenceUrl
        enum status
        number validatedByUserId
        timestamp paymentDate
        number reportedByUserId
        text adminNotes
    }
    Payment }|--|| HousingUnit : "unit"
    Payment }|--|| User : "validatedByUser"
    Payment }|--|| User : "reportedByUser"
    Payment ||--|{ PaymentApplication : "applications"
    PaymentApplication {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        number paymentId
        number chargeId
        int amountApplied
        timestamp appliedAt
    }
    PaymentApplication }|--|| Payment : "payment"
    PaymentApplication }|--|| Charge : "charge"
    Charge {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        number unitId
        number feeScheduleId
        number issuedToUserId
        string description
        int amount
        enum status
        string dueDate
    }
    Charge }|--|| HousingUnit : "unit"
    Charge }|--|| User : "issuedToUser"
    Charge }|--|| FeeSchedule : "feeSchedule"
    Charge ||--|{ PaymentApplication : "applications"
    FeeSchedule {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        number neighborhoodId
        string name
        string description
        int amount
        enum type
        string cronSchedule
        date startDate
        date endDate
        enum status
    }
    FeeSchedule }|--|| Neighborhood : "neighborhood"
    FeeSchedule ||--|{ Charge : "charges"
    Expense {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number createdBy
        number updatedBy
        number deletedBy
        number neighborhoodId
        string description
        int amount
        string evidenceUrl
        enum category
        date expenseDate
        string providerName
    }
    Expense }|--|| Neighborhood : "neighborhood"
```
