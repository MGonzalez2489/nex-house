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
    PaymentConcept {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        string name
        string neighborhoodId
        number defaultAmount
        boolean isActive
        number dayOfMonth
        boolean isRecurrent
        number maxOccurrences
    }
    ResidentPayment {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        string neighborhoodId
        number unitId
        string userId
        decimal amount
        string conceptName
        enum status
        enum method
        string evidenceUrl
        timestamp verifiedAt
    }
    ResidentPayment }|--|| HousingUnit : "unit"
    ResidentDebt {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        number unitId
        string conceptId
        number amount
        string description
        enum status
        date dueDate
    }
    ResidentDebt }|--|| HousingUnit : "unit"
```
