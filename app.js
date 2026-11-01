/* ==========================================================================
   THE THRESHOLD RPG - LÓGICA DA APLICAÇÃO
   ========================================================================== */

// --- CONFIGURAÇÃO GLOBAL ---
const TOTAL_ATTR_POINTS = 10;
const MAX_HP = 32;
const MAX_DET = 25;

// Lista de Atributos Editáveis
const ATTRIBUTES = [
    { id: 'fisico', label: 'Físico' },
    { id: 'mente', label: 'Mente' },
    { id: 'emocao', label: 'Emoção' },
    { id: 'sorte', label: 'Sorte' },
    { id: 'conhecimento', label: 'Conhecimento' },
    { id: 'percepcao', label: 'Percepção' }
];

// Lista de Perícias Editáveis
const SKILLS_LIST = [
    'Acrobacia', 'Arcanismo', 'Atletismo', 'Furtividade',
    'História', 'Intimidação', 'Investigação', 'Medicina',
    'Natureza', 'Percepção', 'Persuasão', 'Prestidigitação',
    'Religião', 'Sobrevivência', 'Tática'
];

// Explicações das Origens
const ORIGIN_DESCRIPTIONS = {
    'Arqueiro': 'Especialista em arco e combate à distância.',
    'Guardião': 'Resistente, preparado para proteger aliados e suportar pressão.',
    'Acólito do Chamado': 'Amante de animais, entende seus comportamentos e costuma conquistar sua confiança.',
    'Caçador': 'Conhece trilhas, rastros e técnicas de sobrevivência.',
    'Erudito': 'Dedicado ao estudo, à história e ao conhecimento.',
    'Curandeiro': 'Cuida dos feridos e possui alto conhecimento de tratamento.',
    'Artesão': 'Habilidoso com ferramentas, criação e reparo de itens.',
    'Viajante': 'Experiente em longas jornadas, costumes locais e caminhos.'
};

// Explicações das Funções na Vila
const VILLAGE_ROLE_DESCRIPTIONS = {
    'Ajudante comunitário': 'Auxilia moradores e participa de tarefas gerais da vila.',
    'Ferreiro': 'Fabrica e conserta armas, ferramentas e equipamentos.',
    'Curandeiro': 'Cuida dos feridos e conhece práticas de tratamento.',
    'Caçador': 'Fornece alimento e conhece os arredores selvagens.',
    'Guarda': 'Ajuda a proteger a vila contra ameaças internas e externas.',
    'Agricultor': 'Trabalha com plantações e criação de animais.',
    'Estalajadeiro': 'Cuida da hospedaria local e conhece muitos rumores.',
    'Erudito': 'Registra histórias e preserva conhecimentos da vila.',
    'Explorador': 'Conhece trilhas secretas, caminhos e ruínas próximas.'
};

// Explicações do Guia Lateral
const HELP_TEXTS = {
    'name': 'Nome do seu personagem no mundo de The Threshold.',
    'title': 'Uma alcunha ou fama pela qual é conhecido (ex: O Destemido).',
    'player': 'Nome da pessoa real que está jogando.',
    'level': 'O nível inicial da campanha (definido pelo Mestre).',
    'origin': 'Origem padrão que ajuda a moldar suas capacidades básicas.',
    'custom-origin': 'Descreva como você define a origem ou estilo do seu personagem.',
    'hp': 'Sua capacidade de aguentar dano físico (Máximo 32).',
    'det': 'Sua força de vontade e resiliência mental (Máximo 25).',
    'village-role': 'Sua ocupação principal se já for um habitante fixo da vila.',
    'arrival': 'Os motivos e circunstâncias que o trouxeram até a vila recentemente.',
    'history': 'Breve resumo do histórico do personagem.',
    'weapons': 'Armas equipadas para combate.',
    'equipment': 'Itens, ferramentas e pertences carregados.',
    'specials': 'Habilidades ou bênçãos sobrenaturais opcionais.'
};

// Estado Atual do Formulário
let attributePoints = {};
let currentPortraitBase64 = '';
let activeCharacterSheet = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initAttributes();
    initSkills();
    renderArchive();
});

// NAVEGAÇÃO DE SEÇÕES
function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    if (sectionId === 'sec-home') document.getElementById('nav-home').classList.add('active');
    if (sectionId === 'sec-creator') document.getElementById('nav-create').classList.add('active');
    if (sectionId === 'sec-archive') {
        document.getElementById('nav-archive').classList.add('active');
        renderArchive();
    }
}

// ATRIBUTOS
function initAttributes() {
    const container = document.getElementById('attr-container');
    container.innerHTML = '';
    
    ATTRIBUTES.forEach(attr => {
        attributePoints[attr.id] = 0;
        
        const div = document.createElement('div');
        div.className = 'attr-box';
        div.innerHTML = `
            <strong>${attr.label}</strong>
            <div class="attr-controls">
                <button type="button" class="btn-ctrl" onclick="changeAttr('${attr.id}', -1)">-</button>
                <span id="val-${attr.id}" class="attr-val">0</span>
                <button type="button" class="btn-ctrl" onclick="changeAttr('${attr.id}', 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    });
    updateAttrDisplay();
}

function changeAttr(attrId, delta) {
    const currentTotal = Object.values(attributePoints).reduce((a, b) => a + b, 0);
    const val = attributePoints[attrId];

    if (delta > 0 && currentTotal >= TOTAL_ATTR_POINTS) return;
    if (delta < 0 && val <= 0) return;

    attributePoints[attrId] += delta;
    updateAttrDisplay();
}

function updateAttrDisplay() {
    const spent = Object.values(attributePoints).reduce((a, b) => a + b, 0);
    const remaining = TOTAL_ATTR_POINTS - spent;

    document.getElementById('attr-pts-left').innerText = remaining;

    ATTRIBUTES.forEach(attr => {
        document.getElementById(`val-${attr.id}`).innerText = attributePoints[attr.id];
    });
}

// PERÍCIAS
function initSkills() {
    const container = document.getElementById('skills-container');
    container.innerHTML = '';

    SKILLS_LIST.forEach(skill => {
        const label = document.createElement('label');
        label.className = 'skill-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${skill}" class="input-skill">
            ${skill}
        `;
        container.appendChild(label);
    });
}

// UPLOAD DE RETRATO
function handlePortraitUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentPortraitBase64 = e.target.result;
            const img = document.getElementById('portrait-preview');
            img.src = currentPortraitBase64;
            img.classList.remove('hidden');
            document.getElementById('portrait-placeholder').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// LÓGICA DE ORIGEM E VILA
function handleOriginChange(val) {
    const inputCustom = document.getElementById('input-custom-origin');
    if (val && val !== 'Outra') {
        inputCustom.value = val;
    }
    const helpBox = document.getElementById('help-content');
    if (ORIGIN_DESCRIPTIONS[val]) {
        helpBox.innerHTML = `<p><strong>${val}:</strong> ${ORIGIN_DESCRIPTIONS[val]}</p>`;
    }
}

function toggleVillageBond(type) {
    const groupResident = document.getElementById('group-resident');
    const groupNewcomer = document.getElementById('group-newcomer');

    if (type === 'resident') {
        groupResident.classList.remove('hidden');
        groupNewcomer.classList.add('hidden');
    } else {
        groupResident.classList.add('hidden');
        groupNewcomer.classList.remove('hidden');
    }
}

function handleRoleChange(val) {
    const inputCustom = document.getElementById('input-custom-role');
    const desc = document.getElementById('village-role-desc');

    if (val === 'Outra') {
        inputCustom.classList.remove('hidden');
        desc.innerText = '';
    } else {
        inputCustom.classList.add('hidden');
        desc.innerText = VILLAGE_ROLE_DESCRIPTIONS[val] || '';
    }
}

// VALIDAÇÕES DA INTERFACE
function validateMax(elementId, maxVal) {
    const el = document.getElementById(elementId);
    if (parseInt(el.value) > maxVal) el.value = maxVal;
    if (parseInt(el.value) < 1) el.value = 1;
}

function updateHelp(key) {
    const helpBox = document.getElementById('help-content');
    if (HELP_TEXTS[key]) {
        helpBox.innerHTML = `<p>${HELP_TEXTS[key]}</p>`;
    }
}

// --- GERAR FICHA E PREPARAR ESTRUTURA ---
function generateSheet() {
    // Validar Pontos de Atributo
    const spent = Object.values(attributePoints).reduce((a, b) => a + b, 0);
    if (spent !== TOTAL_ATTR_POINTS) {
        alert(`Você precisa distribuir exatamente ${TOTAL_ATTR_POINTS} pontos nos atributos! (Restantes: ${TOTAL_ATTR_POINTS - spent})`);
        return;
    }

    // Validar Campos Obrigatórios
    const name = document.getElementById('input-name').value.trim();
    const player = document.getElementById('input-player').value.trim();
    const origin = document.getElementById('input-custom-origin').value.trim();

    if (!name || !player || !origin) {
        alert('Por favor, preencha os campos obrigatórios: Nome do Personagem, Jogador e Origem.');
        return;
    }

    // Coletar Perícias
    const selectedSkills = [];
    document.querySelectorAll('.input-skill:checked').forEach(cb => selectedSkills.push(cb.value));

    // Definir Vínculo com a Vila
    const bondType = document.querySelector('input[name="village-bond"]:checked').value;
    let villageText = '';
    if (bondType === 'resident') {
        const roleSelect = document.getElementById('select-village-role').value;
        const roleText = roleSelect === 'Outra' ? document.getElementById('input-custom-role').value.trim() : roleSelect;
        villageText = `Habitante da vila - Função: ${roleText || 'Morador'}`;
    } else {
        const arrivalReason = document.getElementById('input-arrival-reason').value.trim();
        villageText = `Recém-chegado - Motivo: ${arrivalReason || 'Não informado'}`;
    }

    // Montar Objeto da Ficha
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

    // Preencher a área de renderização da Prévia
    populateRenderSheet(activeCharacterSheet);

    // Salvar localmente
    saveCharacterToStorage(activeCharacterSheet);

    // Exibir seção de Prévia
    showSection('sec-preview');
}

function populateRenderSheet(sheet) {
    document.getElementById('render-name').innerText = sheet.name;
    document.getElementById('render-title').innerText = sheet.title;
    document.getElementById('render-player').innerText = sheet.player;
    document.getElementById('render-level').innerText = sheet.level;
    document.getElementById('render-origin').innerText = sheet.origin;
    document.getElementById('render-hp').innerText = `${sheet.hp} / ${MAX_HP}`;
    document.getElementById('render-det').innerText = `${sheet.det} / ${MAX_DET}`;

    // Retrato
    const imgEl = document.getElementById('render-portrait');
    if (sheet.portrait) {
        imgEl.src = sheet.portrait;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    // Atributos
    const attrList = document.getElementById('render-attrs');
    attrList.innerHTML = '';
    ATTRIBUTES.forEach(attr => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${attr.label}:</strong> ${sheet.attributes[attr.id] || 0}`;
        attrList.appendChild(li);
    });

    // Perícias
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

// --- GERAÇÃO DE IMAGEM PNG ---
function downloadSheetPNG() {
    const target = document.getElementById('render-target');

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

// --- GERENCIAMENTO DO ARQUIVO (LOCALSTORAGE) ---
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
    }
}

function renderArchive() {
    const grid = document.getElementById('archive-grid');
    const search = document.getElementById('archive-search').value.toLowerCase();
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
            ${c.portrait ? `<img src="${c.portrait}" class="archive-card-img" alt="${c.name}">` : '<div class="archive-card-img" style="display:flex;align-items:center;justify-content:center;">🖼️ Sem imagem</div>'}
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
