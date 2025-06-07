document.addEventListener('DOMContentLoaded', async () => {
    const writeupsList = document.getElementById('writeups-grid');
    
    try {
        // Fetch the writeups directory content
        const response = await fetch('https://api.github.com/repos/KaulikMakwana/kaulikmakwana.github.io/contents/writeups/content');
        const directories = await response.json();
        
        // Process each writeup directory
        for (const dir of directories) {
            if (dir.type === 'dir') {
                try {
                    // Fetch the index.md file from each writeup directory
                    const mdResponse = await fetch(`https://api.github.com/repos/KaulikMakwana/kaulikmakwana.github.io/contents/${dir.path}/index.md`);
                    const mdFile = await mdResponse.json();
                    
                    // Decode content and parse front matter
                    const content = atob(mdFile.content);
                    const metadata = parseFrontMatter(content);
                    
                    // Create and append the writeup card
                    const card = createWriteupCard(metadata.data, dir.name);
                    writeupsList.appendChild(card);
                } catch (err) {
                    console.error(`Error loading writeup ${dir.name}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('Error loading writeups:', error);
        writeupsList.innerHTML = '<p class="error">Error loading writeups. Please try again later.</p>';
    }
});

function parseFrontMatter(content) {
    // Match content between first set of --- markers
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { data: {}, content };
    
    try {
        // Parse YAML front matter
        const lines = match[1].split('\n');
        const data = {};
        
        lines.forEach(line => {
            const [key, ...values] = line.split(':');
            if (key && values.length) {
                let value = values.join(':').trim();
                // Handle arrays
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.slice(1, -1).split(',').map(v => v.trim());
                }
                data[key.trim()] = value;
            }
        });
        
        return {
            data,
            content: match[2]
        };
    } catch (e) {
        console.error('Error parsing front matter:', e);
        return { data: {}, content };
    }
}

function createWriteupCard(metadata, dirname) {
    const card = document.createElement('article');
    card.className = 'writeup-card';
    
    card.innerHTML = `
        <h3 class="writeup-title">${metadata.title}</h3>
        <div class="writeup-meta">
            <span class="date">${new Date(metadata.date).toLocaleDateString()}</span>
            <span class="difficulty">${metadata.difficulty}</span>
        </div>
        <div class="writeup-tags">
            ${metadata.tags ? metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
        </div>
        <p class="writeup-excerpt">${metadata.excerpt || ''}</p>
        <a href="/writeups/content/${dirname}" class="read-more">Read Writeup</a>
    `;
    
    return card;
}
