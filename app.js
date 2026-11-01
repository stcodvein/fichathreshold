    const bondRadio = document.querySelector('input[name="village-bond"]:checked');
    const bondType = bondRadio ? bondRadio.value : 'resident';
    let villageText = '';
    if (bondType === 'resident') {
        const roleSelect = document.getElementById('select-village-role').value;
        const roleText = roleSelect === 'Outra' ? document.getElementById('input-custom-role').value.trim() : roleSelect;
        villageText = `Habitante da vila - Função: ${roleText || 'Morador'}`;
    } else {
        const arrivalReason = document.getElementById('input-arrival-reason').value.trim();
        villageText = `Recém-chegado - Motivo: ${arrivalReason || 'Não informado'}`;
    }

    activeCharacterSheet = {
        id: Date.now().toString(),
        name: name,
        title: document.getElementById('input-title').value.trim() || 'Sem Título',
        player: player,
        level: document.getElementById('input-level').value,
        origin: origin,
        hp: document.getElementById('input-hp').value,
        det: document.getElementById('input-det').value,
        portrait: currentPortraitBase64,
        attributes: { ...attributePoints },
        skills: selectedSkills,
        village: villageText,
        history: document.getElementById('input-history').value.trim() || 'Sem histórico detalhado.',
        weapons: document.getElementById('input-weapons').value.trim() || 'Nenhuma',
        equipment: document.getElementById('input-equipment').value.trim() || 'Nenhum',
        specials: document.getElementById('input-specials').value.trim() || 'Nenhuma'
    };

    populateRenderSheet(activeCharacterSheet);
    saveCharacterToStorage(activeCharacterSheet);

    showSection('sec-preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function populateRenderSheet(sheet) {
    document.getElementById('render-name').innerText = sheet.name;
    document.getElementById('render-title').innerText = sheet.title;
    document.getElementById('render-player').innerText = sheet.player;
    document.getElementById('render-level').innerText = sheet.level;
    document.getElementById('render-origin').innerText = sheet.origin;
    document.getElementById('render-hp').innerText = `${sheet.hp} / ${MAX_HP}`;
    document.getElementById('render-det').innerText = `${sheet.det} / ${MAX_DET}`;

    const imgEl = document.getElementById('render-portrait');
    if (sheet.portrait) {
        imgEl.src = sheet.portrait;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    const attrList = document.getElementById('render-attrs');
    attrList.innerHTML = '';
    ATTRIBUTES.forEach(attr => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${attr.label}:</strong> ${sheet.attributes[attr.id] || 0}`;
        attrList.appendChild(li);
    });

    const skillsContainer = document.getElementById('render-skills');
    skillsContainer.innerHTML = '';
    if (sheet.skills.length > 0) {
        sheet.skills.forEach(sk => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerText = sk;
            skillsContainer.appendChild(span);
        });
    } else {
        skillsContainer.innerText = 'Nenhuma perícia selecionada.';
    }

    document.getElementById('render-village').innerText = sheet.village;
    document.getElementById('render-history').innerText = sheet.history;
    document.getElementById('render-weapons').innerText = sheet.weapons;
    document.getElementById('render-equipment').innerText = sheet.equipment;
    document.getElementById('render-specials').innerText = sheet.specials;
}

function downloadSheetPNG() {
    const target = document.getElementById('render-target');
    if (!target) return;

    html2canvas(target, {
        scale: 2,
        backgroundColor: '#181d26',
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `ficha-${activeCharacterSheet.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function getSavedCharacters() {
    return JSON.parse(localStorage.getItem('threshold_chars') || '[]');
}

function saveCharacterToStorage(sheet) {
    let chars = getSavedCharacters();
    chars = chars.filter(c => c.id !== sheet.id);
    chars.push(sheet);
    localStorage.setItem('threshold_chars', JSON.stringify(chars));
}

function deleteCharacter(id) {
    if (confirm('Tem certeza que deseja excluir esta ficha?')) {
        let chars = getSavedCharacters();
        chars = chars.filter(c => c.id !== id);
        localStorage.setItem('threshold_chars', JSON.stringify(chars));
        renderArchive();
    }
}

function viewCharacter(id) {
    const chars = getSavedCharacters();
    const sheet = chars.find(c => c.id === id);
    if (sheet) {
        activeCharacterSheet = sheet;
        populateRenderSheet(sheet);
        showSection('sec-preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderArchive() {
    const grid = document.getElementById('archive-grid');
    const searchInput = document.getElementById('archive-search');
    if (!grid) return;

    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const chars = getSavedCharacters();

    grid.innerHTML = '';

    const filtered = chars.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.player.toLowerCase().includes(search) ||
        c.origin.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="text-muted">Nenhum personagem encontrado.</p>';
        return;
    }

    filtered.forEach(c => {
        const card = document.createElement('div');
        card.className = 'archive-card';
        card.innerHTML = `
            ${c.portrait ? `<img src="${c.portrait}" class="archive-card-img" alt="${c.name}">` : '<div class="archive-card-img" style="display:flex;align-items:center;justify-content:center;color:#9ba4b5;">🖼️ Sem imagem</div>'}
            <div class="archive-card-body">
                <h3>${c.name}</h3>
                <p><em>${c.title}</em></p>
                <p><strong>Jogador:</strong> ${c.player}</p>
                <p><strong>Nível:</strong> ${c.level} | <strong>Origem:</strong> ${c.origin}</p>
            </div>
            <div class="archive-card-actions">
                <button class="btn btn-secondary" onclick="viewCharacter('${c.id}')">Ver Ficha</button>
                <button class="btn btn-danger" onclick="deleteCharacter('${c.id}')">Excluir</button>
            </div>
        `;
        grid.appendChild(card);
    });
                       }
