import chalk from "chalk";
import { getAccessToken } from "./services/database.service";
import { InfoSellerConfig } from "./config";
try {
    await getAccessToken();
    console.log(chalk.greenBright.bold("🔑 Access token carregado do Postgres."));
}
catch (err) {
    console.error(chalk.bgRed.bold("❌ Falha ao carregar access_token:"), err);
    console.error("Config atual:", InfoSellerConfig);
    process.exit(1);
}
