import fs from "node:fs";
import path from "path";

export function createConfig(id, config) {
    const filePath = `uploads/tenant/config/nginx/${id}.conf`;

    // Create the folders if they don't exist
    const directories = ['uploads', 'tenant', 'config', 'nginx'];
    directories.forEach(dir => {
        const dirPath = path.join(...directories.slice(0, directories.indexOf(dir) + 1));
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Created directory ${dirPath}`);
        }
    });

    fs.writeFile(filePath, config, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("file written successfully");
        }
    });
}