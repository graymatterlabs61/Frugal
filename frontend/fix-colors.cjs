const fs = require('fs');
const file = 'e:/Gray Matter Labs/Frugal/frontend/app/(public)/pricing/PricingPageClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/text-background\/70 bg-black\/10 border-black\/20/g, 'text-primary bg-primary/10 border-primary/20');
content = content.replace(/text-background\/80/g, 'text-foreground/90');
content = content.replace(/text-background\/70/g, 'text-foreground/80');
content = content.replace(/text-background\/60/g, 'text-foreground/70');
content = content.replace(/text-background\/50/g, 'text-foreground/60');
content = content.replace(/text-background/g, 'text-foreground');
content = content.replace(/\? "text-foreground\/70" : "text-primary"/g, '? "text-primary" : "text-primary"');
content = content.replace(/bg-background text-foreground hover:bg-background\/90/g, 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20');

fs.writeFileSync(file, content);
console.log("Replaced colors successfully");
