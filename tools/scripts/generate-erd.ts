/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../apps/api/src/database/data-source';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function generate() {
  const mockConfig = {
    get: (key: string, defaultValue?: any) => {
      const val = process.env[key] || defaultValue;
      if (key === 'DB_NAME' && !val) return 'parking_db_temp';
      return val;
    },
  } as any;

  const config = getDatabaseConfig(mockConfig);
  const ds = new DataSource(config);

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await ds.buildMetadatas();

    let mermaid = '# Database Design Document\n\n';
    mermaid += 'This document is auto-generated. Do not edit manually.\n\n';
    mermaid += '### Entity Relationship Diagram\n\n';
    mermaid += '```mermaid\nerDiagram\n';

    ds.entityMetadatas.forEach((entity) => {
      const entityName = entity.name;
      mermaid += `    ${entityName} {\n`;

      entity.columns.forEach((col) => {
        let typeName = 'unknown';

        if (typeof col.type === 'string') {
          typeName = col.type;
        } else if (typeof col.type === 'function') {
          typeName = col.type.name.toLowerCase();
        }

        if (col.isPrimary) typeName = 'int';
        if (
          col.propertyName.toLowerCase().endsWith('id') &&
          typeName === 'unknown'
        )
          typeName = 'int';

        mermaid += `        ${typeName} ${col.propertyName}\n`;
      });
      mermaid += `    }\n`;

      entity.relations.forEach((rel) => {
        const relationSymbol = rel.isManyToOne ? '}|--||' : '||--|{';
        const targetEntity = rel.inverseEntityMetadata.name;
        mermaid += `    ${entityName} ${relationSymbol} ${targetEntity} : "${rel.propertyName}"\n`;
      });
    });

    mermaid += '```\n';

    // Ensure docs directory exists
    const docsDir = path.join(__dirname, '../../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const filePath = path.join(docsDir, 'database-schema.md');
    fs.writeFileSync(filePath, mermaid);

    console.log(`\n🚀 Documentation successfully generated at: ${filePath}`);
  } catch (error) {
    console.error('Fail building metadata:', error);
  }
}

generate();
