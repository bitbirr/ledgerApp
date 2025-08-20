// reset-and-recreate-database.js
import mysql from "mysql2/promise";
import { spawnSync } from "node:child_process";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL. Set it in your environment first.");
  process.exit(1);
}

const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: url.searchParams.get("ssl") === "true",
  authPlugins: url.searchParams.get("authPlugins") || undefined,
};

async function dropAllTables() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log("✅ Connected:", config.database);
    const [tables] = await conn.execute("SHOW TABLES");
    const names = tables.map((r) => Object.values(r)[0]);
    console.log(`Found ${names.length} tables`);

    await conn.execute("SET FOREIGN_KEY_CHECKS=0");
    for (const t of names) {
      await conn.execute(`DROP TABLE IF EXISTS \`${t}\``);
      console.log("Dropped:", t);
    }
    await conn.execute("SET FOREIGN_KEY_CHECKS=1");
    console.log("🧹 Drop complete");
  } finally {
    if (conn) await conn.end();
  }
}

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const { status } = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (status !== 0) process.exit(status ?? 1);
}

(async () => {
  await dropAllTables();
  console.log("🚀 Running migrations…");
  run("npx", ["drizzle-kit", "migrate"]);

  console.log("🌱 Seeding data…");
  run("node", ["setup-najib-el-haji.js"]);

  console.log("✅ Done: database rebuilt & seeded.");
})();
