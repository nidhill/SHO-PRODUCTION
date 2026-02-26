const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const replaceFiles = () => {
    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

    for (const file of files) {
        if (file === 'Login.tsx') continue; // Login does not use Sidebar

        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove Sidebar import
        content = content.replace(/import Sidebar from ['"]@\/components\/Sidebar['"];?\n?/, '');

        // Remove state variables
        content = content.replace(/const \[isCollapsed, setIsCollapsed\] = useState\(false\);\n?/, '');
        content = content.replace(/const \[isMobileOpen, setIsMobileOpen\] = useState\(false\);\n?/, '');

        // Remove Sidebar component and exact wrappers
        content = content.replace(/<div className="min-h-screen bg-background">[\s\S]*?<Sidebar[\s\S]*?\/>/, '');

        // Remove main tag opening
        content = content.replace(/<main className=\{`transition-all duration-200 \$\{isCollapsed \? 'lg:ml-\[72px\]' : 'lg:ml-60'\}`\}>/, '');

        // Clean up closing tags
        // The end of the file typically has: </main> \n </div> \n );
        content = content.replace(/<\/main>\s*<\/div>/, '');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
};

replaceFiles();
