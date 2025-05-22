import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ejecutar prisma db push
exec('npx prisma db push --preview-feature', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error ejecutando db push: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// Alternativamente, genera un SQL
exec('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migration.sql', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generando SQL: ${error.message}`);
    return;
  }
  
  console.log('SQL generado correctamente en prisma/migration.sql');
  
  const sqlPath = path.join(__dirname, 'migration.sql');
  if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Puedes ejecutar este SQL manualmente en el panel de SQL de Supabase:');
    console.log('-----------------------------------');
    console.log(sql);
    console.log('-----------------------------------');
  }
}); 