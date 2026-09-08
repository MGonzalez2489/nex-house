# Database Schema

TypeORM entity schema (`synchronize: true`, no migrations). Entities are registered in `apps/api/src/_core/database/entities/index.ts`.

```mermaid
erDiagram
    COUNTRIES {
        int id PK
        string publicId UK
        string name UK
        string displayName UK
        string code UK
    }
    STATES {
        int id PK
        string publicId UK
        string name
        string displayName UK
        string code
        int countryId FK
    }
    CITIES {
        int id PK
        string publicId UK
        string name
        string displayName UK
        int stateId FK
    }

    NEIGHBORHOODS {
        int id PK
        string publicId UK
        string name UK
        boolean isActive
    }
    NEIGH_STREETS {
        int id PK
        string publicId UK
        string name
        int neighborhoodId FK
    }
    NEIGH_ADDRESS {
        int id PK
        string publicId UK
        string zipCode
        decimal latitude
        decimal longitude
        int cityId FK
        int neighborhoodId FK
    }

    USERS {
        int id PK
        string publicId UK
        string email UK
        string password
        boolean requirePwdChange
        boolean isFirstAdmin
        int neighborhoodId FK
        int roleId FK
        int statusId FK
    }
    USER_PROFILE {
        int id PK
        string publicId UK
        string firstName
        string lastName
        string phone
        int userId FK
        int avatarId FK
    }
    USER_ROLE {
        int id PK
        string publicId UK
        string name
        string displayName
    }
    USER_STATUS {
        int id PK
        string publicId UK
        string name
        string displayName
    }
    USER_UNIT_ROLE {
        int id PK
        string publicId UK
        string name
        string displayName
    }
    USER_UNIT {
        int id PK
        string publicId UK
        boolean isCurrentOccupant
        int userId FK
        int unitId FK
        int userUnitRoleId FK
    }

    UNITS {
        int id PK
        string publicId UK
        string identifier
        int streetId FK
        int typeId FK
        int neighborhoodId FK
        int statusId FK
    }
    UNIT_TYPE {
        int id PK
        string publicId UK
        string name
        string displayName
    }
    UNIT_STATUS {
        int id PK
        string publicId UK
        string name
        string displayName
    }

    FILES {
        int id PK
        string publicId UK
        string originalName
        string fileName
        string mimeType
        bigint size
        string url
        string extension
    }
    SESSIONS {
        int id PK
        string publicId UK
        int userId FK
        text refreshTokenHash
        string socketId
        string browser
        string browserVersion
        string os
        string device
        string ipAddress
        timestamp expiresAt
        boolean revoked
    }

    FEES {
        int id PK
        string publicId UK
        string name
        string description
        int amount
        string type
        string cronSchedule
        string cronDescription
        timestamp startDate
        timestamp endDate
        timestamp lastExecutionDate
        int neighborhoodId FK
        int statusId FK
    }
    FEE_STATUS {
        int id PK
        string publicId UK
        string name
        string displayName
    }

    CHARGES {
        int id PK
        string publicId UK
        int amount
        timestamp dueDate
        string cancelationReason
        int feeId FK
        int unitId FK
        int statusId FK
        int canceledById FK
    }
    CHARGE_STATUS {
        int id PK
        string publicId UK
        string name
        string displayName
    }

    PAYMENTS {
        int id PK
        string publicId UK
        int amount
        timestamp paymentDate
        text adminNotes
        int chargeId FK
        int evidenceId FK
        int statusId FK
        int reportedById FK
    }
    PAYMENT_STATUS {
        int id PK
        string publicId UK
        string name
        string displayName
    }

    TRANSACTIONS {
        int id PK
        string publicId UK
        int amount
        timestamp transactionDate
        string name
        string description
        int neighborhoodId FK
        int typeId FK
        int sourceTypeId FK
        int evidenceId FK
        int reversedById
        int categoryId FK
        int paymentId FK
    }
    TRANSACTION_CATEGORY {
        int id PK
        string publicId UK
        string name
        string displayName
        string icon
        string color
        int neighborhoodId FK
        int forTransactionTypeId FK
        int updatedBy FK
    }
    TRANSACTION_TYPE {
        int id PK
        string publicId UK
        string name
        string displayName
    }
    TRANSACTION_SOURCE {
        int id PK
        string publicId UK
        string name
        string displayName
    }

    COUNTRIES ||--o{ STATES : has
    STATES ||--o{ CITIES : has
    CITIES ||--o{ NEIGH_ADDRESS : has
    NEIGHBORHOODS ||--o{ NEIGH_STREETS : has
    NEIGHBORHOODS ||--o{ NEIGH_ADDRESS : has
    NEIGH_STREETS ||--o{ UNITS : has
    NEIGHBORHOODS ||--o{ UNITS : has

    USERS ||--o{ SESSIONS : has
    USERS ||--o| USER_PROFILE : has
    FILES o|--o| USER_PROFILE : used_as_avatar
    NEIGHBORHOODS ||--o{ USERS : has
    USER_ROLE ||--o{ USERS : assigned
    USER_STATUS ||--o{ USERS : assigned
    UNITS ||--o{ USER_UNIT : hosts
    USERS ||--o{ USER_UNIT : occupies
    USER_UNIT_ROLE ||--o{ USER_UNIT : assigned
    UNIT_TYPE ||--o{ UNITS : classifies
    UNIT_STATUS ||--o{ UNITS : assigned

    NEIGHBORHOODS ||--o{ FEES : charges
    FEE_STATUS ||--o{ FEES : assigned
    FEES ||--o{ CHARGES : generates
    UNITS ||--o{ CHARGES : billed
    CHARGE_STATUS ||--o{ CHARGES : assigned
    USERS ||--o{ CHARGES : canceled_by
    CHARGES ||--o{ PAYMENTS : settles
    PAYMENT_STATUS ||--o{ PAYMENTS : assigned
    FILES ||--o{ PAYMENTS : evidence
    USERS ||--o{ PAYMENTS : reported_by

    NEIGHBORHOODS ||--o{ TRANSACTIONS : books
    TRANSACTION_TYPE ||--o{ TRANSACTIONS : classifies
    TRANSACTION_SOURCE ||--o{ TRANSACTIONS : sourced
    TRANSACTION_CATEGORY ||--o{ TRANSACTIONS : categories
    PAYMENTS o|--o{ TRANSACTIONS : linked
    FILES ||--o{ TRANSACTIONS : evidence
    NEIGHBORHOODS ||--o{ TRANSACTION_CATEGORY : has
    TRANSACTION_TYPE ||--o{ TRANSACTION_CATEGORY : for_type
    USERS ||--o{ TRANSACTION_CATEGORY : updated_by
```

## Legend

- `UK` — unique index. Every table has `id` (PK, exposed as UUID `publicId`).
- **Base classes** (no tables of their own): `BaseEntity` → `id` + `publicId`; `BaseCatalog` adds `name` + `displayName`; `BaseTraceableEntity` is everything in `BaseEntity` plus the audit trail.
- **Audit trail** — all tables marked traceable add `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt` (soft delete), `deletedBy`, with `createdBy`/`updatedBy`/`deletedBy` referencing `users.id`. Catalog tables (`user_role`, `user_status`, `user_unit_role`, `unit_type`, `unit_status`, `fee_status`, `charge_status`, `payment_status`, `transaction_type`, `transaction_source`) extend `BaseCatalog`; `transaction_category` is a `BaseCatalog` with a partial audit trail.
- Location hierarchy is zero-redundancy: `neigh_address` stores only `city_id` (never `state_id`/`country_id`).

## Known schema quirks

- `charges.feedId` — orphan column from a typo; the actual FK to `fees` is `feeId`.
- `transactions.reversedById` — declared NOT NULL but has no FK relationship.
- `transactions.category` property is mis-typed as `Payment`; the FK `categoryId` correctly points at `transaction_category`.
- `sessions.socketId` maps to DB column `socketid`.