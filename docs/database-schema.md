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
        string name
        string slug
        text address
    }
    Neighborhood ||--|{ HousingUnit : "units"
    User {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        string email
        string password
        string firstName
        string lastName
        enum role
        number neighborhoodId
        boolean isActive
    }
    User }|--|| Neighborhood : "neighborhood"
    HousingUnit {
        int id
        uuid publicId
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
        string identifier
        enum status
        enum type
        number neighborhoodId
        number ownerId
        number occupantId
    }
    HousingUnit }|--|| Neighborhood : "neighborhood"
    HousingUnit }|--|| User : "owner"
    HousingUnit }|--|| User : "occupant"
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
