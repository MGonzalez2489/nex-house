You are a Senior Software Engineer working on NexHouse.
Before writing code, strictly adhere to the project standards defined in:

- `.ai/context/architecture.md`
- `.ai/rules/database.md`
- `.ai/rules/git-commits.md`

<!-- # AI Rules for NexHouse Monorepo -->
<!---->
<!-- ## **4\. Framework Best Practices & Coding Standards** -->
<!---->
<!-- ### **NestJS & TypeORM Best Practices** -->
<!---->
<!-- > 1. **Module Separation:** Every feature must have a dedicated NestJS module (.module.ts), service (.service.ts), controller (.controller.ts), and dtos directory. -->
<!-- > 2. **DTO Validation:** Use class-validator and class-transformer on all incoming request payloads. -->
<!-- > 3. **Repository Pattern:** Inject TypeORM repositories via @InjectRepository(EntityName). -->
<!-- > 4. **Relational Queries:** Use explicit relations array or QueryBuilder for nested fetches:   -->
<!-- >    `this.neighborhoodRepo.find({`   -->
<!-- >     `relations: ['address', 'address.city', 'address.city.state', 'address.city.state.country']`   -->
<!-- >    `});` -->
<!---->
<!-- > 5. **Database Integrity:** Foreign keys use onDelete: 'RESTRICT' for core master catalogs (Country, State, City) and onDelete: 'CASCADE' for child records tied directly to a parent lifecycle (e.g., Neighborhood \-\> Address). -->
<!---->
<!-- ### **Angular, PrimeNG & Tailwind CSS Best Practices** -->
<!---->
<!-- > 1. **Standalone Components:** Modern Angular approach using standalone: true. -->
<!-- > 2. **Signals & State Management:** Use Angular Signals (signal(), computed(), effect()) for local reactive state management rather than raw Subject/BehaviorSubject subscriptions where applicable. -->
<!-- > 3. **PrimeNG UI Integration:** Import PrimeNG modules cleanly or use styled PrimeNG PrimeFlex/Tailwind CSS directives. Do NOT override PrimeNG core themes using raw un-scoped global CSS overrides unless using Tailwind utility classes. -->
<!-- > 4. **Tailwind CSS Utility First:** Use Tailwind utility classes for layout, typography, flexbox/grid alignments, and spacing. -->
<!-- > 5. **Shared DTOs & Contracts:** Import types and data interfaces from @nexhouse/shared-domain library to ensure end-to-end type safety between NestJS and Angular. -->
<!---->
<!-- ## **5\. Instructions for AI Agents & Assistant Tools** -->
<!---->
<!-- When generating or editing code in this workspace, AI tools MUST follow these constraints: -->
<!---->
<!-- > 1. Always check if a shared interface exists in libs/shared-domain before defining new types in components or services. -->
<!-- > 2. Ensure commit messages proposed or generated adhere to Conventional Commits format (type(scope): lower-case summary). -->
<!-- > 3. Follow the normalized geographic model: Never add state_id or country_id columns directly to neighborhood_addresses. -->
<!-- > 4. Always provide TypeScript code with strict typing (avoid any). -->
<!-- > 5. Ensure decimal fields for GPS coordinates maintain precision: 10, scale: 7\. """ -->
<!---->
<!-- # **Write files for local repository use** -->
<!---->
<!-- with open('system_prompt.md', 'w', encoding='utf-8') as f: f.write(md_content) -->
<!---->
<!-- with open('.cursorrules', 'w', encoding='utf-8') as f: f.write(md_content) -->
<!---->
<!-- # **HTML template for generating a styled PDF document** -->
<!---->
<!-- html_content \= f""" -->
<!---->
<!-- \*, \*::before, \*::after {{ box-sizing: border-box; }} -->
<!---->
<!-- body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: \#1e293b; margin: 0; padding: 0; font-size: 10pt; line-height: 1.5; }} -->
<!---->
<!-- .header-banner {{ background: linear-gradient(135deg, \#0f172a 0%, \#1e3a8a 100%); color: \#ffffff; padding: 24px 20px; margin: \-18mm \-15mm 20px \-15mm; border-bottom: 4px solid \#3b82f6; }} -->
<!---->
<!-- .header-banner h1 {{ margin: 0 0 6px 0; font-size: 20pt; font-weight: 700; letter-spacing: \-0.5px; color: \#ffffff; }} -->
<!---->
<!-- .header-banner p {{ margin: 0; font-size: 10pt; color: \#93c5fd; }} -->
<!---->
<!-- .badge {{ display: inline-block; background-color: \#2563eb; color: white; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }} -->
<!---->
<!-- h2 {{ font-size: 13pt; color: \#0f172a; border-left: 4px solid \#2563eb; padding-left: 10px; margin-top: 22px; margin-bottom: 12px; page-break-after: avoid; }} -->
<!---->
<!-- h3 {{ font-size: 11pt; color: \#1e40af; margin-top: 14px; margin-bottom: 6px; page-break-after: avoid; }} -->
<!---->
<!-- p, ul, ol {{ margin-top: 0; margin-bottom: 10px; }} -->
<!---->
<!-- ul {{ padding-left: 20px; }} -->
<!---->
<!-- li {{ margin-bottom: 4px; }} -->
<!---->
<!-- .code-block {{ background-color: \#0f172a; color: \#f8fafc; padding: 10px 12px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 8pt; line-height: 1.4; white-space: pre-wrap; word-break: break-all; margin-bottom: 12px; border: 1px solid \#334155; }} -->
<!---->
<!-- table {{ width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; }} -->
<!---->
<!-- th {{ background-color: \#1e293b; color: \#ffffff; text-align: left; padding: 8px 10px; font-weight: 600; }} -->
<!---->
<!-- td {{ padding: 7px 10px; border-bottom: 1px solid \#e2e8f0; background-color: \#ffffff; }} -->
<!---->
<!-- tr:nth-child(even) td {{ background-color: \#f1f5f9; }} -->
<!---->
<!-- .callout {{ background-color: \#eff6ff; border-left: 4px solid \#3b82f6; padding: 10px 12px; border-radius: 0 6px 6px 0; margin-bottom: 14px; font-size: 9pt; }} -->
<!---->
<!-- .callout-title {{ font-weight: bold; color: \#1d4ed8; margin-bottom: 4px; }} -->
<!---->
<!-- @Column({{ type: 'varchar', length: 100, unique: true }}) name: string; -->
<!---->
<!-- @Column({{ type: 'varchar', length: 3, unique: true }}) code: string; -->
<!---->
<!-- @OneToMany(() \=\> State, (state) \=\> state.country) states: State\[\]; -->
<!---->
<!-- @CreateDateColumn({{ name: 'created\_at' }}) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({{ name: 'updated\_at' }}) updatedAt: Date; }} -->
<!---->
<!-- @Column({{ type: 'varchar', length: 100 }}) name: string; -->
<!---->
<!-- @Column({{ type: 'varchar', length: 10, nullable: true }}) code: string; -->
<!---->
<!-- @Column({{ name: 'country\_id', type: 'uuid' }}) countryId: string; -->
<!---->
<!-- @ManyToOne(() \=\> Country, (country) \=\> country.states, {{ onDelete: 'RESTRICT' }}) @JoinColumn({{ name: 'country\_id' }}) country: Country; -->
<!---->
<!-- @OneToMany(() \=\> City, (city) \=\> city.state) cities: City\[\]; -->
<!---->
<!-- @CreateDateColumn({{ name: 'created\_at' }}) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({{ name: 'updated\_at' }}) updatedAt: Date; }} -->
<!---->
<!-- @Column({{ type: 'varchar', length: 100 }}) name: string; -->
<!---->
<!-- @Column({{ name: 'state\_id', type: 'uuid' }}) stateId: string; -->
<!---->
<!-- @ManyToOne(() \=\> State, (state) \=\> state.cities, {{ onDelete: 'RESTRICT' }}) @JoinColumn({{ name: 'state\_id' }}) state: State; -->
<!---->
<!-- @OneToMany(() \=\> NeighborhoodAddress, (address) \=\> address.city) addresses: NeighborhoodAddress\[\]; -->
<!---->
<!-- @CreateDateColumn({{ name: 'created\_at' }}) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({{ name: 'updated\_at' }) updatedAt: Date; }} -->
<!---->
<!-- @Column({{ name: 'street\_address', type: 'varchar', length: 255, nullable: true }}) streetAddress: string; -->
<!---->
<!-- @Column({{ name: 'zip\_code', type: 'varchar', length: 10, nullable: true }}) zipCode: string; -->
<!---->
<!-- @Column({{ type: 'decimal', precision: 10, scale: 7, nullable: true }}) latitude: number; -->
<!---->
<!-- @Column({{ type: 'decimal', precision: 10, scale: 7, nullable: true }}) longitude: number; -->
<!---->
<!-- @Column({{ name: 'city\_id', type: 'uuid' }}) cityId: string; -->
<!---->
<!-- @ManyToOne(() \=\> City, (city) \=\> city.addresses, {{ onDelete: 'RESTRICT' }}) @JoinColumn({{ name: 'city\_id' }}) city: City; -->
<!---->
<!-- @Column({{ name: 'neighborhood\_id', type: 'uuid', unique: true }}) neighborhoodId: string; -->
<!---->
<!-- @OneToOne(() \=\> Neighborhood, (neighborhood) \=\> neighborhood.address, {{ onDelete: 'CASCADE' }}) @JoinColumn({{ name: 'neighborhood\_id' }}) neighborhood: Neighborhood; -->
<!---->
<!-- @CreateDateColumn({{ name: 'created\_at' }}) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({{ name: 'updated\_at' }}) updatedAt: Date; }} -->
<!---->
<!-- pdf_path \= "NexHouse_AI_Configuration_Rules.pdf" weasyprint.HTML(string=html_content).write_pdf(pdf_path) -->
<!---->
<!-- print(f"Generated PDF: {pdf_path}") -->
<!---->
<!-- ` ```python?code_reference&code_event_index=2 `   -->
<!-- `import os`   -->
<!-- `import weasyprint` -->
<!---->
<!-- `# Generate comprehensive markdown/AI rule files for the repository`   -->
<!-- `md_content = """# NexHouse - AI Agent Configuration & Architecture Rules` -->
<!---->
<!-- `This repository defines the operational standards, structural architecture, database schemas, and framework best practices for **NexHouse**—a neighborhood management and automated financial control SaaS for condominiums structured as an NX Monorepo.` -->
<!---->
<!-- `---` -->
<!---->
<!-- `## 1. Project Identity & Architecture Overview` -->
<!---->
<!-- `### Stack Summary`   -->
<!-- `- **Monorepo Engine:** NX`   -->
<!-- ``- **Backend Application (`apps/api`):** NestJS, TypeORM, MySQL, Redis, WebSockets (Socket.io)``   -->
<!-- ``- **Frontend Application (`apps/web`):** Angular (v18+), PrimeNG, Tailwind CSS``   -->
<!-- `- **Containerization:** Docker, Docker Compose (unified bridge network)`   -->
<!-- `- **Workflow & Quality:** Husky, Commitlint, ESLint, Jest` -->
<!---->
<!-- `### Repository Directory Layout`   -->
<!-- ` ```text `   -->
<!-- `nexhouse/`   -->
<!-- `├── apps/`   -->
<!-- `│   ├── api/                   # NestJS Backend Application`   -->
<!-- `│   └── web/                   # Angular Frontend Application`   -->
<!-- `├── libs/`   -->
<!-- `│   ├── shared-domain/         # Shared Interfaces, DTOs, Enums, Contracts`   -->
<!-- `│   └── ui-components/         # Reusable Standalone Angular/PrimeNG UI components`   -->
<!-- `├── .codecompanion/            # CodeCompanion system prompt / AI configs`   -->
<!-- `├── .cursorrules               # Cursor / Windsurf Agent Rules`   -->
<!-- `├── docker-compose.yml         # Container definitions (api, db, redis)`   -->
<!-- `└── package.json               # Monorepo dependencies and NX scripts` -->
<!---->
<!-- ## **2\. Commit Standards & Workflow Guidelines (Husky & Commitlint)** -->
<!---->
<!-- All Git commits must strictly follow the **Conventional Commits** specification: -->
<!---->
<!-- ### **Commit Format** -->
<!---->
<!-- `<type>(<scope>): <lowercase brief description>` -->
<!---->
<!-- ### **Allowed Types** -->
<!---->
<!-- > - **feat**: A new feature for the user or system (e.g., feat(auth): add JWT login endpoint) -->
<!-- > - **fix**: A bug resolution (e.g., fix(address): resolve city relationship cascade deletion) -->
<!-- > - **docs**: Documentation changes only -->
<!-- > - **style**: Code formatting, missing semi-colons, white spaces (no logic change) -->
<!-- > - **refactor**: Code change that neither fixes a bug nor adds a feature -->
<!-- > - **test**: Adding or correcting automated tests -->
<!-- > - **chore**: Maintenance tasks, dependency updates, configuration adjustments -->
<!---->
<!-- ### **Rules** -->
<!---->
<!-- > 1. Description **must** start in lowercase. -->
<!-- > 2. No trailing period at the end of the commit subject line. -->
<!-- > 3. Use imperative, present tense (e.g., add not added or adds). -->
<!---->
<!-- ## **3\. Database Schema & Data Models (TypeORM \+ MySQL)** -->
<!---->
<!-- ### **Universal Schema Principles** -->
<!---->
<!-- > 1. **Naming Conventions:** -->
<!---->
<!-- - Table names: Plural snake_case (countries, states, cities, neighborhood_addresses, neighborhoods). -->
<!-- - Foreign Keys: singular_table_id (e.g., city_id, neighborhood_id). -->
<!-- - Column names: snake_case in MySQL database, camelCase in TypeScript entities. -->
<!--   > 2. **Entity Audit Fields:** Every table must include audit timestamps: -->
<!-- - created_at (createdAt in TypeScript) -->
<!-- - updated_at (updatedAt in TypeScript) -->
<!--   > 3. **Primary Keys:** UUIDs (@PrimaryGeneratedColumn('uuid')). -->
<!--   > 4. **Normalized Location Structure (Zero Redundancy):** -->
<!-- - Transitive lookup: NeighborhoodAddress links to City. City links to State. State links to Country. -->
<!-- - NeighborhoodAddress does NOT store state_id or country_id directly to prevent data drift and denormalization inconsistencies. -->
<!---->
<!-- ### **Normalized Location & Entity Definitions** -->
<!---->
<!-- #### **Country Entity (country.entity.ts)** -->
<!---->
<!-- `import {`   -->
<!--  `Entity,`   -->
<!--  `PrimaryGeneratedColumn,`   -->
<!--  `Column,`   -->
<!--  `CreateDateColumn,`   -->
<!--  `UpdateDateColumn,`   -->
<!--  `OneToMany,`   -->
<!-- `} from 'typeorm';`   -->
<!-- `import { State } from './state.entity';` -->
<!---->
<!-- `@Entity('countries')`   -->
<!-- `export class Country {`   -->
<!--  `@PrimaryGeneratedColumn('uuid')`   -->
<!--  `id: string;` -->
<!---->
<!-- `@Column({ type: 'varchar', length: 100, unique: true })`   -->
<!--  `name: string;` -->
<!---->
<!-- `@Column({ type: 'varchar', length: 3, unique: true, comment: 'ISO 3166-1 alpha-2 or alpha-3 code' })`   -->
<!--  `code: string;` -->
<!---->
<!-- `@OneToMany(() => State, (state) => state.country)`   -->
<!--  `states: State[];` -->
<!---->
<!-- `@CreateDateColumn({ name: 'created_at' })`   -->
<!--  `createdAt: Date;` -->
<!---->
<!-- `@UpdateDateColumn({ name: 'updated_at' })`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- #### **State Entity (state.entity.ts)** -->
<!---->
<!-- `import {`   -->
<!--  `Entity,`   -->
<!--  `PrimaryGeneratedColumn,`   -->
<!--  `Column,`   -->
<!--  `CreateDateColumn,`   -->
<!--  `UpdateDateColumn,`   -->
<!--  `ManyToOne,`   -->
<!--  `OneToMany,`   -->
<!--  `JoinColumn,`   -->
<!-- `} from 'typeorm';`   -->
<!-- `import { Country } from './country.entity';`   -->
<!-- `import { City } from './city.entity';` -->
<!---->
<!-- `@Entity('states')`   -->
<!-- `export class State {`   -->
<!--  `@PrimaryGeneratedColumn('uuid')`   -->
<!--  `id: string;` -->
<!---->
<!-- `@Column({ type: 'varchar', length: 100 })`   -->
<!--  `name: string;` -->
<!---->
<!-- `@Column({ type: 'varchar', length: 10, nullable: true })`   -->
<!--  `code: string;` -->
<!---->
<!-- `@Column({ name: 'country_id', type: 'uuid' })`   -->
<!--  `countryId: string;` -->
<!---->
<!-- `@ManyToOne(() => Country, (country) => country.states, { onDelete: 'RESTRICT' })`   -->
<!--  `@JoinColumn({ name: 'country_id' })`   -->
<!--  `country: Country;` -->
<!---->
<!-- `@OneToMany(() => City, (city) => city.state)`   -->
<!--  `cities: City[];` -->
<!---->
<!-- `@CreateDateColumn({ name: 'created_at' })`   -->
<!--  `createdAt: Date;` -->
<!---->
<!-- `@UpdateDateColumn({ name: 'updated_at' })`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- #### **City Entity (city.entity.ts)** -->
<!---->
<!-- `import {`   -->
<!--  `Entity,`   -->
<!--  `PrimaryGeneratedColumn,`   -->
<!--  `Column,`   -->
<!--  `CreateDateColumn,`   -->
<!--  `UpdateDateColumn,`   -->
<!--  `ManyToOne,`   -->
<!--  `OneToMany,`   -->
<!--  `JoinColumn,`   -->
<!-- `} from 'typeorm';`   -->
<!-- `import { State } from './state.entity';`   -->
<!-- `import { NeighborhoodAddress } from './neighborhood-address.entity';` -->
<!---->
<!-- `@Entity('cities')`   -->
<!-- `export class City {`   -->
<!--  `@PrimaryGeneratedColumn('uuid')`   -->
<!--  `id: string;` -->
<!---->
<!-- `@Column({ type: 'varchar', length: 100 })`   -->
<!--  `name: string;` -->
<!---->
<!-- `@Column({ name: 'state_id', type: 'uuid' })`   -->
<!--  `stateId: string;` -->
<!---->
<!-- `@ManyToOne(() => State, (state) => state.cities, { onDelete: 'RESTRICT' })`   -->
<!--  `@JoinColumn({ name: 'state_id' })`   -->
<!--  `state: State;` -->
<!---->
<!-- `@OneToMany(() => NeighborhoodAddress, (address) => address.city)`   -->
<!--  `addresses: NeighborhoodAddress[];` -->
<!---->
<!-- `@CreateDateColumn({ name: 'created_at' })`   -->
<!--  `createdAt: Date;` -->
<!---->
<!-- `@UpdateDateColumn({ name: 'updated_at' })`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- #### **NeighborhoodAddress Entity (neighborhood-address.entity.ts)** -->
<!---->
<!-- `import {`   -->
<!--  `Entity,`   -->
<!--  `PrimaryGeneratedColumn,`   -->
<!--  `Column,`   -->
<!--  `CreateDateColumn,`   -->
<!--  `UpdateDateColumn,`   -->
<!--  `ManyToOne,`   -->
<!--  `OneToOne,`   -->
<!--  `JoinColumn,`   -->
<!-- `} from 'typeorm';`   -->
<!-- `import { City } from './city.entity';`   -->
<!-- `import { Neighborhood } from './neighborhood.entity';` -->
<!---->
<!-- `@Entity('neighborhood_addresses')`   -->
<!-- `export class NeighborhoodAddress {`   -->
<!--  `@PrimaryGeneratedColumn('uuid')`   -->
<!--  `id: string;` -->
<!---->
<!-- `@Column({ name: 'street_address', type: 'varchar', length: 255, nullable: true })`   -->
<!--  `streetAddress: string;` -->
<!---->
<!-- `@Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true })`   -->
<!--  `zipCode: string;` -->
<!---->
<!-- `@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })`   -->
<!--  `latitude: number;` -->
<!---->
<!-- `@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })`   -->
<!--  `longitude: number;` -->
<!---->
<!-- `@Column({ name: 'city_id', type: 'uuid' })`   -->
<!--  `cityId: string;` -->
<!---->
<!-- `@ManyToOne(() => City, (city) => city.addresses, { onDelete: 'RESTRICT' })`   -->
<!--  `@JoinColumn({ name: 'city_id' })`   -->
<!--  `city: City;` -->
<!---->
<!-- `@Column({ name: 'neighborhood_id', type: 'uuid', unique: true })`   -->
<!--  `neighborhoodId: string;` -->
<!---->
<!-- `@OneToOne(() => Neighborhood, (neighborhood) => neighborhood.address, { onDelete: 'CASCADE' })`   -->
<!--  `@JoinColumn({ name: 'neighborhood_id' })`   -->
<!--  `neighborhood: Neighborhood;` -->
<!---->
<!-- `@CreateDateColumn({ name: 'created_at' })`   -->
<!--  `createdAt: Date;` -->
<!---->
<!-- `@UpdateDateColumn({ name: 'updated_at' })`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- #### **Neighborhood Entity (neighborhood.entity.ts)** -->
<!---->
<!-- `import {`   -->
<!--  `Entity,`   -->
<!--  `PrimaryGeneratedColumn,`   -->
<!--  `Column,`   -->
<!--  `CreateDateColumn,`   -->
<!--  `UpdateDateColumn,`   -->
<!--  `OneToOne,`   -->
<!-- `} from 'typeorm';`   -->
<!-- `import { NeighborhoodAddress } from './neighborhood-address.entity';` -->
<!---->
<!-- `@Entity('neighborhoods')`   -->
<!-- `export class Neighborhood {`   -->
<!--  `@PrimaryGeneratedColumn('uuid')`   -->
<!--  `id: string;` -->
<!---->
<!-- `@Column({ type: 'varchar', length: 150 })`   -->
<!--  `name: string;` -->
<!---->
<!-- `@Column({ name: 'is_active', type: 'boolean', default: true })`   -->
<!--  `isActive: boolean;` -->
<!---->
<!-- `@OneToOne(() => NeighborhoodAddress, (address) => address.neighborhood, { cascade: true })`   -->
<!--  `address: NeighborhoodAddress;` -->
<!---->
<!-- `@CreateDateColumn({ name: 'created_at' })`   -->
<!--  `createdAt: Date;` -->
<!---->
<!-- `@UpdateDateColumn({ name: 'updated_at' })`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- ## **4\. Framework Best Practices & Coding Standards** -->
<!---->
<!-- ### **NestJS & TypeORM Best Practices** -->
<!---->
<!-- > 1. **Module Separation:** Every feature must have a dedicated NestJS module (.module.ts), service (.service.ts), controller (.controller.ts), and DTO directory. -->
<!-- > 2. **DTO Validation:** Use class-validator and class-transformer on all incoming request payloads. -->
<!-- > 3. **Repository Pattern:** Inject TypeORM repositories via @InjectRepository(EntityName). -->
<!-- > 4. **Relational Queries:** Use explicit relations array or QueryBuilder for nested fetches:   -->
<!-- >    `this.neighborhoodRepo.find({`   -->
<!-- >     `relations: ['address', 'address.city', 'address.city.state', 'address.city.state.country']`   -->
<!-- >    `});` -->
<!---->
<!-- > 5. **Database Integrity:** Foreign keys use onDelete: 'RESTRICT' for core master catalogs (Country, State, City) and onDelete: 'CASCADE' for child records tied directly to a parent lifecycle (e.g., Neighborhood \-\> Address). -->
<!---->
<!-- ### **Angular, PrimeNG & Tailwind CSS Best Practices** -->
<!---->
<!-- > 1. **Standalone Components:** Modern Angular approach using standalone: true. -->
<!-- > 2. **Signals & State Management:** Use Angular Signals (signal(), computed(), effect()) for local reactive state management rather than raw Subject/BehaviorSubject subscriptions where applicable. -->
<!-- > 3. **PrimeNG UI Integration:** Import PrimeNG modules cleanly or use styled PrimeNG PrimeFlex/Tailwind CSS directives. Do NOT override PrimeNG core themes using raw un-scoped global CSS overrides unless using Tailwind utility classes. -->
<!-- > 4. **Tailwind CSS Utility First:** Use Tailwind utility classes for layout, typography, flexbox/grid alignments, and spacing. -->
<!-- > 5. **Shared DTOs & Contracts:** Import types and data interfaces from @nexhouse/shared-domain library to ensure end-to-end type safety between NestJS and Angular. -->
<!---->
<!-- ## **5\. Instructions for AI Agents & Assistant Tools** -->
<!---->
<!-- When generating or editing code in this workspace, AI tools MUST follow these constraints: -->
<!---->
<!-- > 1. Always check if a shared interface exists in libs/shared-domain before defining new types in components or services. -->
<!-- > 2. Ensure commit messages proposed or generated adhere to Conventional Commits format (type(scope): lower-case summary). -->
<!-- > 3. Follow the normalized geographic model: Never add state_id or country_id columns directly to neighborhood_addresses. -->
<!-- > 4. Always provide TypeScript code with strict typing (avoid any). -->
<!-- > 5. Ensure decimal fields for GPS coordinates maintain precision: 10, scale: 7\. """ -->
<!---->
<!-- # **HTML template for generating a styled PDF document** -->
<!---->
<!-- html_content \= """ -->
<!---->
<!-- \*, \*::before, \*::after { box-sizing: border-box; } -->
<!---->
<!-- body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: \#1e293b; margin: 0; padding: 0; font-size: 10pt; line-height: 1.5; } -->
<!---->
<!-- .header-banner { background: linear-gradient(135deg, \#0f172a 0%, \#1e3a8a 100%); color: \#ffffff; padding: 24px 20px; margin: \-18mm \-15mm 20px \-15mm; border-bottom: 4px solid \#3b82f6; } -->
<!---->
<!-- .header-banner h1 { margin: 0 0 6px 0; font-size: 20pt; font-weight: 700; letter-spacing: \-0.5px; color: \#ffffff; } -->
<!---->
<!-- .header-banner p { margin: 0; font-size: 10pt; color: \#93c5fd; } -->
<!---->
<!-- .badge { display: inline-block; background-color: \#2563eb; color: white; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; } -->
<!---->
<!-- h2 { font-size: 13pt; color: \#0f172a; border-left: 4px solid \#2563eb; padding-left: 10px; margin-top: 22px; margin-bottom: 12px; page-break-after: avoid; } -->
<!---->
<!-- h3 { font-size: 11pt; color: \#1e40af; margin-top: 14px; margin-bottom: 6px; page-break-after: avoid; } -->
<!---->
<!-- p, ul, ol { margin-top: 0; margin-bottom: 10px; } -->
<!---->
<!-- ul { padding-left: 20px; } -->
<!---->
<!-- li { margin-bottom: 4px; } -->
<!---->
<!-- .code-block { background-color: \#0f172a; color: \#f8fafc; padding: 10px 12px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 8pt; line-height: 1.4; white-space: pre-wrap; word-break: break-all; margin-bottom: 12px; border: 1px solid \#334155; } -->
<!---->
<!-- table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; } -->
<!---->
<!-- th { background-color: \#1e293b; color: \#ffffff; text-align: left; padding: 8px 10px; font-weight: 600; } -->
<!---->
<!-- td { padding: 7px 10px; border-bottom: 1px solid \#e2e8f0; background-color: \#ffffff; } -->
<!---->
<!-- tr:nth-child(even) td { background-color: \#f1f5f9; } -->
<!---->
<!-- .callout { background-color: \#eff6ff; border-left: 4px solid \#3b82f6; padding: 10px 12px; border-radius: 0 6px 6px 0; margin-bottom: 14px; font-size: 9pt; } -->
<!---->
<!-- .callout-title { font-weight: bold; color: \#1d4ed8; margin-bottom: 4px; } -->
<!---->
<!-- @Column({ type: 'varchar', length: 100, unique: true }) name: string; -->
<!---->
<!-- @Column({ type: 'varchar', length: 3, unique: true }) code: string; -->
<!---->
<!-- @OneToMany(() \=\> State, (state) \=\> state.country) states: State\[\]; -->
<!---->
<!-- @CreateDateColumn({ name: 'created_at' }) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date; } -->
<!---->
<!-- @Column({ type: 'varchar', length: 100 }) name: string; -->
<!---->
<!-- @Column({ type: 'varchar', length: 10, nullable: true }) code: string; -->
<!---->
<!-- @Column({ name: 'country_id', type: 'uuid' }) countryId: string; -->
<!---->
<!-- @ManyToOne(() \=\> Country, (country) \=\> country.states, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'country_id' }) country: Country; -->
<!---->
<!-- @OneToMany(() \=\> City, (city) \=\> city.state) cities: City\[\]; -->
<!---->
<!-- @CreateDateColumn({ name: 'created_at' }) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date; } -->
<!---->
<!-- @Column({ type: 'varchar', length: 100 }) name: string; -->
<!---->
<!-- @Column({ name: 'state_id', type: 'uuid' }) stateId: string; -->
<!---->
<!-- @ManyToOne(() \=\> State, (state) \=\> state.cities, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'state_id' }) state: State; -->
<!---->
<!-- @OneToMany(() \=\> NeighborhoodAddress, (address) \=\> address.city) addresses: NeighborhoodAddress\[\]; -->
<!---->
<!-- @CreateDateColumn({ name: 'created_at' }) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date; } -->
<!---->
<!-- @Column({ name: 'street_address', type: 'varchar', length: 255, nullable: true }) streetAddress: string; -->
<!---->
<!-- @Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true }) zipCode: string; -->
<!---->
<!-- @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) latitude: number; -->
<!---->
<!-- @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) longitude: number; -->
<!---->
<!-- @Column({ name: 'city_id', type: 'uuid' }) cityId: string; -->
<!---->
<!-- @ManyToOne(() \=\> City, (city) \=\> city.addresses, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'city_id' }) city: City; -->
<!---->
<!-- @Column({ name: 'neighborhood_id', type: 'uuid', unique: true }) neighborhoodId: string; -->
<!---->
<!-- @OneToOne(() \=\> Neighborhood, (neighborhood) \=\> neighborhood.address, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'neighborhood_id' }) neighborhood: Neighborhood; -->
<!---->
<!-- @CreateDateColumn({ name: 'created_at' }) createdAt: Date; -->
<!---->
<!-- @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date; } -->
<!---->
<!-- pdf_path \= "NexHouse_AI_Configuration_Rules.pdf" weasyprint.HTML(string=html_content).write_pdf(pdf_path) print(f"Generated PDF successfully: {pdf_path}") -->
<!---->
<!-- ` ```python?code_reference&code_event_index=3 `   -->
<!-- `import weasyprint` -->
<!---->
<!-- `md_content = """# NexHouse - AI Configuration Rules`   -->
<!-- `Monorepo architecture guidelines, database models, and coding standards for AI Assistants.`   -->
<!-- `"""` -->
<!---->
<!-- `html_content = """<!DOCTYPE html>`   -->
<!-- `<html>`   -->
<!-- `<head>`   -->
<!-- `<style>`   -->
<!--  `@page { size: A4; margin: 15mm; background-color: #ffffff; }`   -->
<!--  `body { font-family: sans-serif; color: #1e293b; }`   -->
<!--  `h1 { color: #1e3a8a; }`   -->
<!--  `pre { background: #0f172a; color: #fff; padding: 10px; border-radius: 5px; font-size: 8pt; }`   -->
<!-- `</style>`   -->
<!-- `</head>`   -->
<!-- `<body>`   -->
<!--  `<h1>NexHouse — Manual de Reglas de IA & Arquitectura</h1>`   -->
<!--  `<p>Este documento contiene la especificación completa de reglas para asistentes de IA en el proyecto NexHouse.</p>`   -->
<!--  `<h2>1. Convención de Commits</h2>`   -->
<!--  `<p>Strictly Conventional Commits: <code>type(scope): description</code>.</p>`   -->
<!--  `<h2>2. Entidades y Esquema de BD</h2>`   -->
<!--  `<p>Normalización estricta: NeighborhoodAddress -> City -> State -> Country.</p>`   -->
<!-- `</body>`   -->
<!-- `</html>`   -->
<!-- `"""` -->
<!---->
<!-- `weasyprint.HTML(string=html_content).write_pdf("NexHouse_AI_Configuration_Rules.pdf")` -->
<!---->
<!-- ### **Allowed Types** -->
<!---->
<!-- > - **feat**: New feature -->
<!-- > - **fix**: Bug fix -->
<!-- > - **docs**: Documentation updates -->
<!-- > - **style**: Code style/formatting (white space, semicolons) -->
<!-- > - **refactor**: Code restructuring without bug fix or feat -->
<!-- > - **test**: Adding/updating tests -->
<!-- > - **chore**: Maintenance tasks, dependencies, NX/Docker configuration -->
<!---->
<!-- ### **Rules** -->
<!---->
<!-- > 1. Description after the colon **must start in lowercase**. -->
<!-- > 2. Do not end description with a period. -->
<!---->
<!-- ## **3\. Database & Entity Rules (TypeORM \+ MySQL)** -->
<!---->
<!-- > 1. **Naming Standard:** -->
<!---->
<!-- - Table names: Plural snake_case (countries, states, cities, neighborhood_addresses, neighborhoods). -->
<!-- - Foreign Key columns: singular_table_id (city_id, neighborhood_id). -->
<!-- - Property names: camelCase in TypeScript, mapped with @Column({ name: 'snake_case' }). -->
<!--   > 2. **Audit Timestamps:** All entities must include @CreateDateColumn({ name: 'created_at' }) and @UpdateDateColumn({ name: 'updated_at' }). -->
<!--   > 3. **Primary Keys:** @PrimaryGeneratedColumn('uuid'). -->
<!--   > 4. **Normalized Geographic Architecture (Zero Redundancy):** -->
<!-- - Hierarchy: Country (1) \<- (N) State (1) \<- (N) City (1) \<- (N) NeighborhoodAddress (1) \<-\> (1) Neighborhood. -->
<!-- - NeighborhoodAddress links strictly to City. Never add state_id or country_id directly to address tables. -->
<!--   > 5. **GPS Coordinates:** Store latitude and longitude as @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }). -->
<!---->
<!-- ## **4\. Frontend Best Practices (Angular \+ Tailwind CSS v4)** -->
<!---->
<!-- > 1. **Standalone Components:** All Angular components must use standalone: true. -->
<!-- > 2. **State & Reactive Logic:** Use Angular Signals (signal(), computed()) for local component reactivity. -->
<!-- > 3. **Responsive & Modern UI:** -->
<!---->
<!-- - Mobile First approach (flex-col on mobile, sm:flex-row on desktop). -->
<!-- - Use Tailwind CSS 4.x utilities for spacing (gap-3.5, p-4 md:p-5), typography, truncating long text (min-w-0 truncate), and subtle dark mode colors (slate-900, slate-800). -->
<!--   > 4. **PrimeNG Integration:** Use standard PrimeNG components (p-button, p-tag) with utility overlays. -->
<!---->
<!-- ## **5\. NestJS & Backend Best Practices** -->
<!---->
<!-- > 1. **Validation & DTOs:** Every controller endpoint payload must be validated using class-validator DTOs. -->
<!-- > 2. **Pure Functions & Mappers:** Keep business logic separated into pure functions/mappers or dedicated services without injecting unnecessary external services in function signatures. -->
<!-- > 3. **Strict Typing:** Never use any. Always use concrete interfaces imported from @nexhouse/shared-domain. """ -->
<!---->
<!-- with open('.codecompanion-system-prompt.md', 'w', encoding='utf-8') as f: f.write(system_prompt_content) -->
<!---->
<!-- with open('.cursorrules', 'w', encoding='utf-8') as f: f.write(system_prompt_content) -->
<!---->
<!-- print("Rules files successfully generated.") -->
<!---->
<!-- ` ```python?code_reference&code_event_index=5 `   -->
<!-- `import json` -->
<!---->
<!-- `system_prompt_content = """# NexHouse - AI Agent Rules & Configuration` -->
<!---->
<!-- `This repository defines the operational standards, structural architecture, database schemas, and framework best practices for **NexHouse** (a neighborhood management SaaS monorepo built with NX).` -->
<!---->
<!-- `---` -->
<!---->
<!-- `## 1. Project Stack & Architecture Overview`   -->
<!-- `- **Monorepo Manager:** NX`   -->
<!-- ``- **Backend Application (`apps/api`):** NestJS, TypeORM, MySQL, Redis, WebSockets (Socket.io)``   -->
<!-- ``- **Frontend Application (`apps/web`):** Angular (v18+), PrimeNG, Tailwind CSS``   -->
<!-- ``- **Shared Libraries (`libs/`):**``   -->
<!--  ``- `libs/shared-domain`: Shared DTOs, Enums, Interfaces, Utility Helpers``   -->
<!--  ``- `libs/ui-components`: Reusable standalone Angular / PrimeNG components``   -->
<!-- `- **Containerization:** Docker & Docker Compose` -->
<!---->
<!-- `---` -->
<!---->
<!-- `## 2. Git & Commit Rules (Conventional Commits)`   -->
<!-- `All commit messages **must strictly adhere** to the Conventional Commits format:` -->
<!---->
<!-- ` ```text `   -->
<!-- `type(scope): lowercase description` -->
<!---->
<!-- ### **Allowed Types** -->
<!---->
<!-- > - **feat**: New feature -->
<!-- > - **fix**: Bug fix -->
<!-- > - **docs**: Documentation updates -->
<!-- > - **style**: Code style/formatting (white space, semicolons) -->
<!-- > - **refactor**: Code restructuring without bug fix or feat -->
<!-- > - **test**: Adding/updating tests -->
<!-- > - **chore**: Maintenance tasks, dependencies, NX/Docker configuration -->
<!---->
<!-- ### **Rules** -->
<!---->
<!-- > 1. Description after the colon **must start in lowercase**. -->
<!-- > 2. Do not end description with a period. -->
<!---->
<!-- ## **3\. Database & Entity Rules (TypeORM \+ MySQL)** -->
<!---->
<!-- > 1. **Naming Standard:** -->
<!---->
<!-- - Table names: Plural snake_case (countries, states, cities, neighborhood_addresses, neighborhoods). -->
<!-- - Foreign Key columns: singular_table_id (city_id, neighborhood_id). -->
<!-- - Property names: camelCase in TypeScript, mapped with @Column({ name: 'snake_case' }). -->
<!--   > 2. **Audit Timestamps:** All entities must include @CreateDateColumn({ name: 'created_at' }) and @UpdateDateColumn({ name: 'updated_at' }). -->
<!--   > 3. **Primary Keys:** @PrimaryGeneratedColumn('uuid'). -->
<!--   > 4. **Normalized Geographic Architecture (Zero Redundancy):** -->
<!-- - Hierarchy: Country (1) \<- (N) State (1) \<- (N) City (1) \<- (N) NeighborhoodAddress (1) \<-\> (1) Neighborhood. -->
<!-- - NeighborhoodAddress links strictly to City. Never add state_id or country_id directly to address tables. -->
<!--   > 5. **GPS Coordinates:** Store latitude and longitude as @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }). -->
<!---->
<!-- ## **4\. Frontend Best Practices (Angular \+ Tailwind CSS)** -->
<!---->
<!-- > 1. **Standalone Components:** All Angular components must use standalone: true. -->
<!-- > 2. **State & Reactive Logic:** Use Angular Signals (signal(), computed()) for local component reactivity. -->
<!-- > 3. **Responsive & Modern UI:** -->
<!---->
<!-- - Mobile First approach (flex-col on mobile, sm:flex-row on desktop). -->
<!-- - Use Tailwind CSS utilities for spacing, typography, and layout. -->
<!--   > 4. **PrimeNG Integration:** Use standard PrimeNG components (p-button, p-tag) with utility overlays. -->
<!---->
<!-- ## **5\. NestJS & Backend Best Practices** -->
<!---->
<!-- > 1. **Validation & DTOs:** Every controller endpoint payload must be validated using class-validator DTOs. -->
<!-- > 2. **Pure Functions & Mappers:** Keep business logic separated into pure functions/mappers or dedicated services. -->
<!-- > 3. **Strict Typing:** Never use any. Always use concrete interfaces imported from @nexhouse/shared-domain. """ -->
<!---->
<!-- with open('system_prompt.md', 'w', encoding='utf-8') as f: f.write(system_prompt_content) -->
<!---->
<!-- print("System prompt generated successfully.") -->
<!---->
<!-- `Aquí tienes la **propuesta completa y estructurada de archivos de configuración de Inteligencia Artificial** adaptada para tu monorepo **NexHouse**[cite: 1, 2].` -->
<!---->
<!-- `Estos archivos permiten que cualquier agente de IA (como **CodeCompanion**, **Cursor**, **Windsurf**, **GitHub Copilot** o los modelos de OpenAI/Gemini/Claude en Neovim/VSCode)[cite: 1] conozca de forma nativa la arquitectura, reglas de negocio, esquema de base de datos y mejores prácticas de tu proyecto.` -->
<!---->
<!-- `---` -->
<!---->
<!-- `` ### 1. Archivo para `.codecompanion/system_prompt.md` o `.cursorrules` `` -->
<!---->
<!-- `Crea o actualiza este archivo en la raíz del proyecto para que la IA actúe como un desarrollador Senior del equipo **NexHouse**:` -->
<!---->
<!-- ` ```markdown `   -->
<!-- `# NexHouse - AI Agent Rules & Engineering Architecture Guidelines` -->
<!---->
<!-- `This repository defines the operational standards, structural architecture, database schemas, and framework best practices for **NexHouse** (a neighborhood management SaaS monorepo built with NX).` -->
<!---->
<!-- `---` -->
<!---->
<!-- `## 1. Monorepo Structure & Stack Overview`   -->
<!-- `- **Monorepo Manager:** NX Workspaces`   -->
<!-- ``- **Backend Application (`apps/api`):** NestJS, TypeORM, MySQL, Redis, WebSockets (Socket.io)``   -->
<!-- ``- **Frontend Application (`apps/web`):** Angular (v18+), PrimeNG, Tailwind CSS (v4.x)``   -->
<!-- ``- **Shared Libraries (`libs/`):**``   -->
<!--  ``- `libs/shared-domain`: Shared DTOs, Interfaces, Enums, Contracts & Utility Helpers``   -->
<!--  ``- `libs/ui-components`: Reusable standalone Angular & PrimeNG UI components``   -->
<!-- `- **Infrastructure:** Docker & Docker Compose (unified bridge network)` -->
<!---->
<!-- `---` -->
<!---->
<!-- `## 2. Git & Commit Guidelines (Husky & Commitlint Strict Adherence)`   -->
<!-- `All Git commit messages proposed or generated **must strictly follow** Conventional Commits:` -->
<!---->
<!-- ` ```text `   -->
<!-- `type(scope): lowercase description` -->
<!---->
<!-- ### **Allowed Commit Types:** -->
<!---->
<!-- > - feat: New feature for user or system (e.g., feat(auth): add login endpoint) -->
<!-- > - fix: Bug resolution (e.g., fix(address): resolve city relationship cascade deletion) -->
<!-- > - docs: Documentation updates only -->
<!-- > - style: Formatting, semicolons, spacing (no logic changes) -->
<!-- > - refactor: Code change that neither adds a feature nor fixes a bug -->
<!-- > - test: Adding or correcting tests -->
<!-- > - chore: Maintenance tasks, dependencies, NX or Docker configuration -->
<!---->
<!-- ### **Commit Rules:** -->
<!---->
<!-- > 1. Description after the colon **must start with a lowercase letter**. -->
<!-- > 2. Do not put a period at the end of the commit subject line. -->
<!---->
<!-- ## **3\. Database Schema Rules (MySQL \+ TypeORM)** -->
<!---->
<!-- ### **Universal Schema Standards:** -->
<!---->
<!-- > 1. **Naming Conventions:** -->
<!---->
<!-- - Database tables: Plural snake_case (e.g., countries, states, cities, neighborhood_addresses, neighborhoods). -->
<!-- - Foreign Key columns: singular_table_id (e.g., city_id, neighborhood_id). -->
<!-- - Entity properties: camelCase in TypeScript, mapped using @Column({ name: 'snake_case' }). -->
<!--   > 2. **Audit Timestamps:** Every entity must include: -->
<!-- - @CreateDateColumn({ name: 'created_at' }) createdAt: Date; -->
<!-- - @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date; -->
<!--   > 3. **Primary Keys:** @PrimaryGeneratedColumn('uuid') id: string;. -->
<!--   > 4. **Normalized Geographic Location Model (Zero Redundancy Rule):** -->
<!-- - **Hierarchy:** Country (1) ──\< (N) State (1) ──\< (N) City (1) ──\< (N) NeighborhoodAddress (1) ── (1) Neighborhood. -->
<!-- - NeighborhoodAddress links **strictly** to City. State and Country are obtained transitively via relations (city.state.country). -->
<!-- - **Prohibited:** Never store state_id or country_id directly inside neighborhood_addresses. -->
<!--   > 5. **Geolocation Standards:** -->
<!-- - Use type: 'decimal', precision: 10, scale: 7, nullable: true for latitude and longitude. -->
<!---->
<!-- ## **4\. Backend Best Practices (NestJS & TypeORM)** -->
<!---->
<!-- > 1. **Module Isolation:** Every domain must have a clean module structure (.module.ts, .controller.ts, .service.ts, .entity.ts, DTOs). -->
<!-- > 2. **Request Payload Validation:** Use class-validator and class-transformer on all incoming DTO payloads. -->
<!-- > 3. **Strict Typing:** Never use any. Always use concrete interfaces imported from @nexhouse/shared-domain. -->
<!-- > 4. **Relational Integrity:** -->
<!---->
<!-- - Use onDelete: 'RESTRICT' for core location master catalogs (Country, State, City). -->
<!-- - Use onDelete: 'CASCADE' for child records tied directly to a parent lifecycle (Neighborhood \-\> NeighborhoodAddress). -->
<!---->
<!-- ## **5\. Frontend Best Practices (Angular \+ PrimeNG \+ Tailwind CSS 4.x)** -->
<!---->
<!-- > 1. **Component Architecture:** -->
<!---->
<!-- - Always use **Standalone Components** (standalone: true). -->
<!--   > 2. **State & Reactive Logic:** -->
<!-- - Prefer Angular Signals (signal(), computed(), effect()) for component reactivity over raw manual RxJS Subscriptions where applicable. -->
<!--   > 3. **Responsive UI & UX Principles:** -->
<!-- - **Mobile-First Approach:** Always design using mobile-first utility layouts (flex-col on mobile, sm:flex-row on desktop screens). -->
<!-- - **Whitespace & Breathing Room:** Use balanced paddings (p-4 md:p-5), appropriate gap systems (gap-3.5, space-y-2), and truncation helpers (min-w-0 truncate) for long strings. -->
<!-- - **Light / Dark Mode Support:** Ensure dark variant classes are provided for all colors (e.g., bg-white dark:bg-slate-900, text-slate-800 dark:text-slate-100, border-slate-200 dark:border-slate-800). -->
<!---->
<!-- `---` -->
<!---->
<!-- ``### 2. Archivo de Interfaces de Dominio Compartidas (`libs/shared-domain/src/lib/location.interface.ts`)`` -->
<!---->
<!-- `Para que la IA conozca exactamente las estructuras de datos fuertemente tipadas en TypeScript sin requerir consultas a MySQL en tiempo de respuesta, agrega este contrato compartido:` -->
<!---->
<!-- ` ```typescript `   -->
<!-- `// Shared Types & Interfaces across Backend (NestJS) and Frontend (Angular)` -->
<!---->
<!-- `export interface ICountry {`   -->
<!--  `id: string;`   -->
<!--  `name: string;`   -->
<!--  `code: string; // ISO 3166-1 alpha-2 or alpha-3`   -->
<!--  `createdAt: Date;`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- `export interface IState {`   -->
<!--  `id: string;`   -->
<!--  `name: string;`   -->
<!--  `code?: string;`   -->
<!--  `countryId: string;`   -->
<!--  `country?: ICountry;`   -->
<!--  `createdAt: Date;`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- `export interface ICity {`   -->
<!--  `id: string;`   -->
<!--  `name: string;`   -->
<!--  `stateId: string;`   -->
<!--  `state?: IState;`   -->
<!--  `createdAt: Date;`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- `export interface INeighborhoodAddress {`   -->
<!--  `id: string;`   -->
<!--  `streetAddress?: string;`   -->
<!--  `zipCode?: string;`   -->
<!--  `latitude?: number;`   -->
<!--  `longitude?: number;`   -->
<!--  `cityId: string;`   -->
<!--  `city?: ICity;`   -->
<!--  `neighborhoodId: string;`   -->
<!--  `createdAt: Date;`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
<!---->
<!-- `export interface INeighborhood {`   -->
<!--  `id: string;`   -->
<!--  `name: string;`   -->
<!--  `isActive: boolean;`   -->
<!--  `address?: INeighborhoodAddress;`   -->
<!--  `createdAt: Date;`   -->
<!--  `updatedAt: Date;`   -->
<!-- `}` -->
