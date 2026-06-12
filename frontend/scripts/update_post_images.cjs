const fs = require('fs');
const path = require('path');

const blogDir = 'e:/Gray Matter Labs/Frugal/frontend/app/blog';

const replacements = {
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=3540&auto=format&fit=crop': '/images/blog/prompt_caching.png',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3540&auto=format&fit=crop': '/images/blog/openai_anthropic.png',
  'https://images.unsplash.com/photo-1607799279861-4dddf913c1f1?q=80&w=3540&auto=format&fit=crop': '/images/blog/llm_retries.png',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3540&auto=format&fit=crop': '/images/blog/polling_worker.png',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=3540&auto=format&fit=crop': '/images/blog/rate_limits.png',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=3540&auto=format&fit=crop': '/images/blog/byok_security.png',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=3540&auto=format&fit=crop': '/images/blog/hard_caps.png',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=3540&auto=format&fit=crop': '/images/blog/aes_encryption.png',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=3540&auto=format&fit=crop': '/images/blog/image_gen.png',
  'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=3540&auto=format&fit=crop': '/images/blog/nextjs_dashboard.png',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=3540&auto=format&fit=crop': '/images/blog/supabase_rls.png',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=3540&auto=format&fit=crop': '/images/blog/webhook_queue.png',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=3540&auto=format&fit=crop': '/images/blog/api_keys_ui.png',
  'https://images.unsplash.com/photo-1719716136369-59ecf938a911?q=80&w=3540&auto=format&fit=crop': '/images/blog/cover_story.png'
};

const entries = fs.readdirSync(blogDir, { withFileTypes: true });
for (const entry of entries) {
  if (entry.isDirectory()) {
    const pagePath = path.join(blogDir, entry.name, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      let changed = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
          changed = true;
        }
      }
      
      // Handle the two that had duplicate Unsplash IDs initially based on their slug/folder
      if (entry.name === 'analyzed-10m-api-tokens-wasting-money') {
        content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1551288049-bebda4e38f71\?q=80&w=3540&auto=format&fit=crop/g, '/images/blog/data_tokens.png');
        changed = true;
      } else if (entry.name === 'build-real-time-spend-chart-tailwind-recharts') {
        content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1551288049-bebda4e38f71\?q=80&w=3540&auto=format&fit=crop/g, '/images/blog/spend_chart.png');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(pagePath, content);
        console.log(`Updated images in ${entry.name}`);
      }
    }
  }
}
