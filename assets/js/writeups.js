document.addEventListener('DOMContentLoaded', async () => {
    const writeupsList = document.getElementById('writeups-grid');
    
    try {
        const response = await fetch('https://api.github.com/repos/KaulikMakwana/kaulikmakwana.github.io/contents/writeups/content');
        const directories = await response.json();
        
        for (const dir of directories) {
            if (dir.type === 'dir') {
                const metadataResponse = await fetch(`https://api.github.com/repos/KaulikMakwana/kaulikmakwana.github.io/contents/${dir.path}/index.md`);
                const metadata = await metadataResponse.json();
                const content = atob(metadata.content);
                
                const frontMatter = parseFrontMatter(content);
                const card = createWriteupCard(frontMatter.data, dir.name);
                writeupsList.appendChild(card);
            }
        }
    } catch (error) {
        console.error('Error loading writeups:', error);
        writeupsList.innerHTML = '<p class="error">Error loading writeups. Please try again later.</p>';
    }
});

function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { data: {}, content };
    
    try {
        return {
            data: jsyaml.load(match[1]),
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
        <h2 class="writeup-title">${metadata.title}</h2>
        <div class="writeup-meta">
            <span class="date">${new Date(metadata.date).toLocaleDateString()}</span>
            <span class="difficulty">${metadata.difficulty}</span>
        </div>
        <div class="writeup-tags">
            ${metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <p class="writeup-excerpt">${metadata.excerpt}</p>
        <a href="/writeups/content/${dirname}" class="read-more">Read Writeup</a>
    `;
    
    return card;
}
