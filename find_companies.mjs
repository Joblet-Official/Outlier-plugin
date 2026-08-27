import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/jobs.db');

// Find a generic word in titles that yields 2-3 distinct companies
const stmt = db.prepare(`
  SELECT 
    word, 
    COUNT(DISTINCT company) as num_companies, 
    group_concat(DISTINCT company) as companies,
    COUNT(id) as total_jobs
  FROM (
    SELECT id, company, title,
           lower(substr(title, 1, instr(title || ' ', ' ') - 1)) as word
    FROM jobs
  )
  GROUP BY word
  HAVING num_companies >= 2 AND num_companies <= 3 AND length(word) > 4
  ORDER BY total_jobs DESC
  LIMIT 5
`);

console.log("Single word searches yielding 2-3 companies:");
console.log(stmt.all());

const stmt2 = db.prepare(`
  SELECT title, COUNT(DISTINCT company) as num_companies, group_concat(DISTINCT company) as companies 
  FROM jobs 
  GROUP BY title 
  HAVING num_companies >= 2 AND num_companies <= 3
  ORDER BY num_companies DESC
  LIMIT 5
`);
console.log("\nExact titles yielding 2-3 companies:");
console.log(stmt2.all());
