const fs = require('fs');
let content = fs.readFileSync('e:/Gray Matter Labs/Frugal/frontend/app/blog/page.tsx', 'utf8');

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

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
}

// Handle the duplicate Unsplash IDs
content = content.replace(/"category": "Data Science",\s*"image": "\/images\/blog\/openai_anthropic\.png"/g, '"category": "Data Science",\n    "image": "/images/blog/data_tokens.png"');
content = content.replace(/"category": "UI\/UX",\s*"image": "\/images\/blog\/openai_anthropic\.png"/g, '"category": "UI/UX",\n    "image": "/images/blog/spend_chart.png"');

fs.writeFileSync('e:/Gray Matter Labs/Frugal/frontend/app/blog/page.tsx', content);
console.log('Images updated.');
