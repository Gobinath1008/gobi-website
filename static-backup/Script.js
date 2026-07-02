document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. NAVBAR & HAMBURGER MENU ---*/
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    // Toggle menu
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking links
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    }));

    // Close menu when clicking outside the navbar
    document.addEventListener('click', (e) => {
        if (navbar && navMenu && !navbar.contains(e.target) && navMenu.classList.contains('active')) {
            if (hamburger) hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    /* --- 2. HEADER SCROLL EFFECT ---*/
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(10, 15, 30, 0.85)';
            header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
            header.style.boxShadow = 'none';
        }
    });

    /* --- 3. ADMIN DASHBOARD & DATA STORAGE --- */
    const ADMIN_PASSWORD = "gobiUK@008";
    let state = null;
    let editContext = null; // Stores info about what is being edited currently

    // DOM References
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminStatusBar = document.getElementById('admin-status-bar');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const passwordModal = document.getElementById('password-modal');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const passwordError = document.getElementById('password-error');
    const passwordCancelBtn = document.getElementById('password-cancel-btn');
    const passwordSubmitBtn = document.getElementById('password-submit-btn');

    const adminFormModal = document.getElementById('admin-form-modal');
    const adminEditForm = document.getElementById('admin-edit-form');
    const dynamicFormFields = document.getElementById('dynamic-form-fields');
    const modalTitle = document.getElementById('modal-title');
    const formCancelBtn = document.getElementById('form-cancel-btn');
    const closeFormModal = document.getElementById('close-form-modal');

    // Extract default data from DOM on first run
    function extractInitialData() {
        const softSkills = [];
        document.querySelectorAll('#soft-skills-list li').forEach(li => {
            // Remove checkmark icon and trim
            const text = li.innerText.replace(/✔|✓/g, '').trim();
            if (text) softSkills.push(text);
        });

        const interests = [];
        document.querySelectorAll('#interests-list li').forEach(li => {
            const text = li.innerText.replace(/✔|✓/g, '').trim();
            if (text) interests.push(text);
        });

        const languages = [];
        document.querySelectorAll('#languages-list li').forEach(li => {
            const html = li.innerHTML.trim();
            if (html) languages.push(html);
        });

        const technicalSkills = [];
        document.querySelectorAll('#skills-grid-container .skill-card').forEach(card => {
            const icon = card.querySelector('i')?.className || 'fa-solid fa-laptop-code';
            const name = card.querySelector('h3')?.innerText || '';
            if (name) {
                technicalSkills.push({ icon, name });
            }
        });

        const projects = [];
        document.querySelectorAll('#projects-grid-container .project-card').forEach(card => {
            const year = card.querySelector('.project-year')?.innerText || '';
            const org = card.querySelector('.project-org')?.innerText || '';
            const title = card.querySelector('h3')?.innerText || '';
            const desc = card.querySelector('.project-desc')?.innerText || '';
            const tech = Array.from(card.querySelectorAll('.tech-stack span')).map(span => span.innerText);
            const link = card.querySelector('.project-link')?.getAttribute('href') || '';
            projects.push({ year, org, title, desc, tech, link });
        });

        const education = [];
        document.querySelectorAll('#education-timeline-container .timeline-item').forEach(item => {
            const date = item.querySelector('.timeline-date')?.innerText || '';
            const degree = item.querySelector('h3')?.innerText || '';
            const school = item.querySelector('.school-name')?.innerText || '';
            const grade = item.querySelector('.gpa-badge')?.innerText || '';
            education.push({ date, degree, school, grade });
        });

        const certifications = [];
        document.querySelectorAll('#certifications-grid-container .cert-card').forEach(card => {
            const title = card.querySelector('h4')?.innerText || '';
            const org = card.querySelector('.cert-org')?.innerText || '';
            const year = card.querySelector('.cert-year')?.innerText || '';
            const img = card.querySelector('img')?.getAttribute('src') || '';
            certifications.push({ title, org, year, img });
        });

        return {
            hero: {
                title: document.getElementById('hero-title')?.innerText.replace(' Edit', '') || 'Hi, I\'m Gobinath S',
                subtitle: document.getElementById('hero-subtitle')?.innerText.replace(' Edit', '') || 'MCA Student',
                desc: document.getElementById('hero-desc')?.innerText.replace(' Edit', '') || '',
                cvLink: document.getElementById('hero-cv-link')?.getAttribute('href') || '',
                imgSrc: document.getElementById('hero-img')?.getAttribute('src') || ''
            },
            about: {
                text: document.getElementById('about-text')?.innerText.replace(' Edit', '') || ''
            },
            skills: {
                technical: technicalSkills,
                soft: softSkills.length ? softSkills : ['Problem Solving', 'Time Management', 'Quick Learner'],
                interests: interests.length ? interests : ['Programming', 'Web & App Development'],
                languages: languages.length ? languages : ['<strong>Tamil</strong> - Native', '<strong>English</strong> - Professional']
            },
            projects: projects,
            education: education,
            certifications: certifications
        };
    }

    // Load from local storage or bootstrap
    function loadState() {
        const saved = localStorage.getItem('portfolio_data');
        if (saved) {
            try {
                state = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved state, loading default.", e);
                state = extractInitialData();
            }
        } else {
            state = extractInitialData();
            saveState();
        }
    }

    function saveState() {
        localStorage.setItem('portfolio_data', JSON.stringify(state));
    }

    // Rendering Engine
    function renderAll() {
        renderHero();
        renderAbout();
        renderSkills();
        renderProjects();
        renderEducation();
        renderCertifications();

        // Refresh AOS animations
        if (window.AOS) {
            AOS.refresh();
        }
    }

    function renderHero() {
        const title = document.getElementById('hero-title');
        const subtitle = document.getElementById('hero-subtitle');
        const desc = document.getElementById('hero-desc');
        const cvLink = document.getElementById('hero-cv-link');
        const img = document.getElementById('hero-img');

        if (title) {
            title.innerHTML = state.hero.title + ` <button class="inline-edit-trigger" data-section="hero" data-field="title"><i class="fa-solid fa-pen"></i> Edit</button>`;
        }
        if (subtitle) {
            subtitle.innerHTML = state.hero.subtitle + ` <button class="inline-edit-trigger" data-section="hero" data-field="subtitle"><i class="fa-solid fa-pen"></i> Edit</button>`;
        }
        if (desc) {
            desc.innerHTML = state.hero.desc + ` <button class="inline-edit-trigger" data-section="hero" data-field="desc" data-long="true"><i class="fa-solid fa-pen"></i> Edit</button>`;
        }
        if (cvLink) {
            cvLink.setAttribute('href', state.hero.cvLink);
        }
        if (img) {
            img.setAttribute('src', state.hero.imgSrc);
        }

        // Hero Extra Trigger (for images and CV link)
        if (document.querySelector('.hero-text') && !document.getElementById('hero-extra-edit-btn')) {
            const container = document.querySelector('.hero-text');
            const editBtn = document.createElement('button');
            editBtn.id = 'hero-extra-edit-btn';
            editBtn.className = 'block-edit-trigger';
            editBtn.innerHTML = '<i class="fa-solid fa-image"></i> Edit Hero Image & CV';
            editBtn.addEventListener('click', () => {
                openEditModal('Hero Media & Link', [
                    { name: 'cvLink', label: 'Resume/CV File Path or URL', type: 'text', value: state.hero.cvLink },
                    { name: 'imgSrc', label: 'Profile Image Path or URL', type: 'text', value: state.hero.imgSrc }
                ], (data) => {
                    state.hero.cvLink = data.cvLink;
                    state.hero.imgSrc = data.imgSrc;
                    saveState();
                    renderHero();
                });
            });
            container.appendChild(editBtn);
        }
    }

    function renderAbout() {
        const aboutText = document.getElementById('about-text');
        if (aboutText) {
            aboutText.innerHTML = state.about.text + ` <button class="inline-edit-trigger" data-section="about" data-field="text" data-long="true"><i class="fa-solid fa-pen"></i> Edit</button>`;
        }
    }

    function renderSkills() {
        // Technical Skills
        const container = document.getElementById('skills-grid-container');
        if (container) {
            // Keep original cards empty, render from state
            container.innerHTML = '';
            state.skills.technical.forEach((skill, index) => {
                const card = document.createElement('div');
                card.className = 'skill-card';
                card.setAttribute('data-aos', 'zoom-in');
                card.setAttribute('data-aos-delay', (index * 50).toString());
                card.innerHTML = `
                    <i class="${skill.icon}"></i>
                    <h3>${skill.name}</h3>
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="skill" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="skill" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                container.appendChild(card);
            });

            // Add Skill Card
            const addCard = document.createElement('div');
            addCard.className = 'add-new-card';
            addCard.innerHTML = `
                <i class="fa-solid fa-circle-plus"></i>
                <span>Add Skill</span>
            `;
            addCard.addEventListener('click', () => {
                openEditModal('Add Technical Skill', [
                    { name: 'name', label: 'Skill Name', type: 'text', value: '' },
                    { name: 'icon', label: 'FontAwesome Icon Class (e.g. fa-brands fa-html5)', type: 'text', value: 'fa-solid fa-laptop-code' }
                ], (data) => {
                    state.skills.technical.push(data);
                    saveState();
                    renderSkills();
                });
            });
            container.appendChild(addCard);
        }

        // Soft Skills List
        const softList = document.getElementById('soft-skills-list');
        if (softList) {
            softList.innerHTML = '';
            state.skills.soft.forEach((skill, index) => {
                const li = document.createElement('li');
                li.style.position = 'relative';
                li.innerHTML = `
                    <i class="fa-solid fa-check"></i> ${skill}
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="soft-skill" data-index="${index}" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="soft-skill" data-index="${index}" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                softList.appendChild(li);
            });

            // Add soft skill button
            const addBtn = document.createElement('li');
            addBtn.className = 'admin-only';
            addBtn.innerHTML = `<button class="inline-edit-trigger" style="display: inline-flex;" id="add-soft-skill-btn"><i class="fa-solid fa-plus"></i> Add Soft Skill</button>`;
            softList.appendChild(addBtn);
            addBtn.querySelector('button').addEventListener('click', () => {
                openEditModal('Add Soft Skill', [
                    { name: 'name', label: 'Soft Skill Name', type: 'text', value: '' }
                ], (data) => {
                    if (data.name.trim()) {
                        state.skills.soft.push(data.name.trim());
                        saveState();
                        renderSkills();
                    }
                });
            });
        }

        // Interests List
        const interestsList = document.getElementById('interests-list');
        if (interestsList) {
            interestsList.innerHTML = '';
            state.skills.interests.forEach((item, index) => {
                const li = document.createElement('li');
                li.style.position = 'relative';
                li.innerHTML = `
                    <i class="fa-solid fa-check"></i> ${item}
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="interest" data-index="${index}" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="interest" data-index="${index}" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                interestsList.appendChild(li);
            });

            const addBtn = document.createElement('li');
            addBtn.className = 'admin-only';
            addBtn.innerHTML = `<button class="inline-edit-trigger" style="display: inline-flex;" id="add-interest-btn"><i class="fa-solid fa-plus"></i> Add Interest</button>`;
            interestsList.appendChild(addBtn);
            addBtn.querySelector('button').addEventListener('click', () => {
                openEditModal('Add Interest', [
                    { name: 'name', label: 'Interest', type: 'text', value: '' }
                ], (data) => {
                    if (data.name.trim()) {
                        state.skills.interests.push(data.name.trim());
                        saveState();
                        renderSkills();
                    }
                });
            });
        }

        // Languages List
        const languagesList = document.getElementById('languages-list');
        if (languagesList) {
            languagesList.innerHTML = '';
            state.skills.languages.forEach((item, index) => {
                const li = document.createElement('li');
                li.style.position = 'relative';
                li.innerHTML = `
                    ${item}
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="language" data-index="${index}" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="language" data-index="${index}" style="width: 24px; height: 24px; font-size: 0.7rem;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                languagesList.appendChild(li);
            });

            const addBtn = document.createElement('li');
            addBtn.className = 'admin-only';
            addBtn.innerHTML = `<button class="inline-edit-trigger" style="display: inline-flex;" id="add-language-btn"><i class="fa-solid fa-plus"></i> Add Language</button>`;
            languagesList.appendChild(addBtn);
            addBtn.querySelector('button').addEventListener('click', () => {
                openEditModal('Add Language', [
                    { name: 'name', label: 'Language Name', type: 'text', value: '' },
                    { name: 'level', label: 'Fluency Level (e.g. Native, Professional)', type: 'text', value: '' }
                ], (data) => {
                    if (data.name.trim()) {
                        const formatted = `<strong>${data.name.trim()}</strong>` + (data.level.trim() ? ` - ${data.level.trim()}` : '');
                        state.skills.languages.push(formatted);
                        saveState();
                        renderSkills();
                    }
                });
            });
        }
    }

    function renderProjects() {
        const container = document.getElementById('projects-grid-container');
        if (container) {
            container.innerHTML = '';
            state.projects.forEach((proj, index) => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', (index * 100).toString());
                card.innerHTML = `
                    <div class="project-header">
                        <span class="project-year">${proj.year}</span>
                        <span class="project-org">${proj.org}</span>
                    </div>
                    <h3>${proj.title}</h3>
                    <p class="project-desc">${proj.desc}</p>
                    <div class="tech-stack">
                        ${proj.tech.map(t => `<span>${t}</span>`).join('')}
                    </div>
                    ${proj.link ? `
                    <a href="${proj.link}" target="_blank" class="project-link">
                        <span>Visit Live Demo</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>` : ''}
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="project" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="project" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                container.appendChild(card);
            });

            // Add Project Card
            const addCard = document.createElement('div');
            addCard.className = 'add-new-card';
            addCard.innerHTML = `
                <i class="fa-solid fa-circle-plus"></i>
                <span>Add Project</span>
            `;
            addCard.addEventListener('click', () => {
                openEditModal('Add Project', [
                    { name: 'year', label: 'Year', type: 'text', value: new Date().getFullYear().toString() },
                    { name: 'org', label: 'Organization/Institution', type: 'text', value: '' },
                    { name: 'title', label: 'Project Title', type: 'text', value: '' },
                    { name: 'desc', label: 'Description', type: 'textarea', value: '' },
                    { name: 'tech', label: 'Tech Stack (comma separated)', type: 'text', value: '' },
                    { name: 'link', label: 'Live Demo URL', type: 'text', value: '' }
                ], (data) => {
                    const techArray = data.tech.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    state.projects.push({
                        year: data.year,
                        org: data.org,
                        title: data.title,
                        desc: data.desc,
                        tech: techArray,
                        link: data.link
                    });
                    saveState();
                    renderProjects();
                });
            });
            container.appendChild(addCard);
        }
    }

    function renderEducation() {
        const container = document.getElementById('education-timeline-container');
        if (container) {
            container.innerHTML = '';
            state.education.forEach((edu, index) => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                const isEven = index % 2 === 0;
                item.setAttribute('data-aos', isEven ? 'fade-right' : 'fade-left');
                if (!isEven) {
                    item.setAttribute('data-aos-delay', '100');
                }

                item.innerHTML = `
                    <div class="timeline-content">
                        <span class="timeline-date">${edu.date}</span>
                        <h3>${edu.degree}</h3>
                        <p class="school-name">${edu.school}</p>
                        <span class="gpa-badge">${edu.grade}</span>
                    </div>
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="education" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="education" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                container.appendChild(item);
            });

            // Add Education Card
            const addCard = document.createElement('div');
            addCard.className = 'add-new-card';
            addCard.style.maxWidth = '850px';
            addCard.style.margin = '2rem auto 0';
            addCard.style.minHeight = '100px';
            addCard.innerHTML = `
                <i class="fa-solid fa-circle-plus"></i>
                <span>Add Education Milestone</span>
            `;
            addCard.addEventListener('click', () => {
                openEditModal('Add Education', [
                    { name: 'date', label: 'Date/Duration (e.g. 2025 - Present)', type: 'text', value: '' },
                    { name: 'degree', label: 'Degree/Course Title', type: 'text', value: '' },
                    { name: 'school', label: 'School/Institution Name', type: 'text', value: '' },
                    { name: 'grade', label: 'Grade/CGPA/Percentage', type: 'text', value: '' }
                ], (data) => {
                    state.education.push(data);
                    saveState();
                    renderEducation();
                });
            });
            container.appendChild(addCard);
        }
    }

    function renderCertifications() {
        const container = document.getElementById('certifications-grid-container');
        if (container) {
            container.innerHTML = '';
            state.certifications.forEach((cert, index) => {
                const card = document.createElement('div');
                card.className = 'cert-card';
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', (index * 100).toString());
                card.innerHTML = `
                    <h4>${cert.title}</h4>
                    <p class="cert-org">${cert.org}</p>
                    <span class="cert-year">${cert.year}</span>
                    ${cert.img ? `<img src="${cert.img}" alt="${cert.title} Certificate">` : ''}
                    <div class="item-admin-overlay">
                        <button class="admin-card-btn admin-btn-edit" data-type="certification" data-index="${index}"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-card-btn admin-btn-delete" data-type="certification" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                container.appendChild(card);
            });

            // Add Cert Card
            const addCard = document.createElement('div');
            addCard.className = 'add-new-card';
            addCard.innerHTML = `
                <i class="fa-solid fa-circle-plus"></i>
                <span>Add Certification</span>
            `;
            addCard.addEventListener('click', () => {
                openEditModal('Add Certification', [
                    { name: 'title', label: 'Certification Title', type: 'text', value: '' },
                    { name: 'org', label: 'Issuing Organization', type: 'text', value: '' },
                    { name: 'year', label: 'Year', type: 'text', value: new Date().getFullYear().toString() },
                    { name: 'img', label: 'Image URL or File Path', type: 'text', value: 'images/' }
                ], (data) => {
                    state.certifications.push(data);
                    saveState();
                    renderCertifications();
                });
            });
            container.appendChild(addCard);
        }
    }

    // Modal Field Generation & Display
    function openEditModal(title, fields, onSubmitCallback) {
        modalTitle.innerText = title;
        dynamicFormFields.innerHTML = '';

        fields.forEach(f => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.innerText = f.label;
            formGroup.appendChild(label);

            let input;
            if (f.type === 'textarea') {
                input = document.createElement('textarea');
                input.value = f.value;
            } else {
                input = document.createElement('input');
                input.type = f.type;
                input.value = f.value;
            }
            input.name = f.name;
            input.id = `input-${f.name}`;
            formGroup.appendChild(input);

            dynamicFormFields.appendChild(formGroup);
        });

        // Set submit handler
        adminEditForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = {};
            fields.forEach(f => {
                const element = document.getElementById(`input-${f.name}`);
                formData[f.name] = element ? element.value : '';
            });
            onSubmitCallback(formData);
            closeEditModal();
        };

        adminFormModal.classList.add('active');
    }

    function closeEditModal() {
        adminFormModal.classList.remove('active');
    }

    // General Click listener for Dynamic Event Delegation (helps with dynamic edit & deletes)
    document.addEventListener('click', (e) => {
        // Inline Title/Description Edit buttons
        const inlineTrigger = e.target.closest('.inline-edit-trigger');
        if (inlineTrigger) {
            const section = inlineTrigger.getAttribute('data-section');
            const field = inlineTrigger.getAttribute('data-field');
            const isLong = inlineTrigger.getAttribute('data-long') === 'true';
            
            const currentValue = state[section][field];
            const cleanTitle = field.charAt(0).toUpperCase() + field.slice(1);

            openEditModal(`Edit ${section.toUpperCase()} ${cleanTitle}`, [
                {
                    name: 'text',
                    label: cleanTitle,
                    type: isLong ? 'textarea' : 'text',
                    value: currentValue
                }
            ], (data) => {
                state[section][field] = data.text;
                saveState();
                if (section === 'hero') renderHero();
                if (section === 'about') renderAbout();
            });
            return;
        }

        // Edit Card Buttons
        const editBtn = e.target.closest('.admin-btn-edit');
        if (editBtn) {
            const type = editBtn.getAttribute('data-type');
            const index = parseInt(editBtn.getAttribute('data-index'), 10);

            if (type === 'skill') {
                const skill = state.skills.technical[index];
                openEditModal('Edit Technical Skill', [
                    { name: 'name', label: 'Skill Name', type: 'text', value: skill.name },
                    { name: 'icon', label: 'FontAwesome Icon Class', type: 'text', value: skill.icon }
                ], (data) => {
                    state.skills.technical[index] = data;
                    saveState();
                    renderSkills();
                });
            } else if (type === 'soft-skill') {
                const skillName = state.skills.soft[index];
                openEditModal('Edit Soft Skill', [
                    { name: 'name', label: 'Soft Skill Name', type: 'text', value: skillName }
                ], (data) => {
                    if (data.name.trim()) {
                        state.skills.soft[index] = data.name.trim();
                        saveState();
                        renderSkills();
                    }
                });
            } else if (type === 'interest') {
                const interest = state.skills.interests[index];
                openEditModal('Edit Interest', [
                    { name: 'name', label: 'Interest', type: 'text', value: interest }
                ], (data) => {
                    if (data.name.trim()) {
                        state.skills.interests[index] = data.name.trim();
                        saveState();
                        renderSkills();
                    }
                });
            } else if (type === 'language') {
                // Parse standard language string e.g. "<strong>Tamil</strong> - Native"
                const langStr = state.skills.languages[index];
                let name = langStr;
                let level = '';
                const match = langStr.match(/<strong>(.*?)<\/strong>(?:\s*-\s*(.*))?/);
                if (match) {
                    name = match[1];
                    level = match[2] || '';
                }
                openEditModal('Edit Language', [
                    { name: 'name', label: 'Language Name', type: 'text', value: name },
                    { name: 'level', label: 'Fluency Level (e.g. Native, Professional)', type: 'text', value: level }
                ], (data) => {
                    if (data.name.trim()) {
                        const formatted = `<strong>${data.name.trim()}</strong>` + (data.level.trim() ? ` - ${data.level.trim()}` : '');
                        state.skills.languages[index] = formatted;
                        saveState();
                        renderSkills();
                    }
                });
            } else if (type === 'project') {
                const proj = state.projects[index];
                openEditModal('Edit Project', [
                    { name: 'year', label: 'Year', type: 'text', value: proj.year },
                    { name: 'org', label: 'Organization/Institution', type: 'text', value: proj.org },
                    { name: 'title', label: 'Project Title', type: 'text', value: proj.title },
                    { name: 'desc', label: 'Description', type: 'textarea', value: proj.desc },
                    { name: 'tech', label: 'Tech Stack (comma separated)', type: 'text', value: proj.tech.join(', ') },
                    { name: 'link', label: 'Live Demo URL', type: 'text', value: proj.link }
                ], (data) => {
                    const techArray = data.tech.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    state.projects[index] = {
                        year: data.year,
                        org: data.org,
                        title: data.title,
                        desc: data.desc,
                        tech: techArray,
                        link: data.link
                    };
                    saveState();
                    renderProjects();
                });
            } else if (type === 'education') {
                const edu = state.education[index];
                openEditModal('Edit Education', [
                    { name: 'date', label: 'Date/Duration', type: 'text', value: edu.date },
                    { name: 'degree', label: 'Degree/Course Title', type: 'text', value: edu.degree },
                    { name: 'school', label: 'School/Institution Name', type: 'text', value: edu.school },
                    { name: 'grade', label: 'Grade/CGPA/Percentage', type: 'text', value: edu.grade }
                ], (data) => {
                    state.education[index] = data;
                    saveState();
                    renderEducation();
                });
            } else if (type === 'certification') {
                const cert = state.certifications[index];
                openEditModal('Edit Certification', [
                    { name: 'title', label: 'Certification Title', type: 'text', value: cert.title },
                    { name: 'org', label: 'Issuing Organization', type: 'text', value: cert.org },
                    { name: 'year', label: 'Year', type: 'text', value: cert.year },
                    { name: 'img', label: 'Image URL or File Path', type: 'text', value: cert.img }
                ], (data) => {
                    state.certifications[index] = data;
                    saveState();
                    renderCertifications();
                });
            }
            return;
        }

        // Delete Card Buttons
        const deleteBtn = e.target.closest('.admin-btn-delete');
        if (deleteBtn) {
            const type = deleteBtn.getAttribute('data-type');
            const index = parseInt(deleteBtn.getAttribute('data-index'), 10);
            
            if (confirm(`Are you sure you want to delete this ${type}?`)) {
                if (type === 'skill') {
                    state.skills.technical.splice(index, 1);
                    renderSkills();
                } else if (type === 'soft-skill') {
                    state.skills.soft.splice(index, 1);
                    renderSkills();
                } else if (type === 'interest') {
                    state.skills.interests.splice(index, 1);
                    renderSkills();
                } else if (type === 'language') {
                    state.skills.languages.splice(index, 1);
                    renderSkills();
                } else if (type === 'project') {
                    state.projects.splice(index, 1);
                    renderProjects();
                } else if (type === 'education') {
                    state.education.splice(index, 1);
                    renderEducation();
                } else if (type === 'certification') {
                    state.certifications.splice(index, 1);
                    renderCertifications();
                }
                saveState();
            }
            return;
        }
    });

    // Close form modal event listeners
    if (formCancelBtn) formCancelBtn.addEventListener('click', closeEditModal);
    if (closeFormModal) closeFormModal.addEventListener('click', closeEditModal);

    // Authentication & State Toggling
    function enterAdminMode() {
        document.body.classList.add('admin-mode');
        sessionStorage.setItem('isAdmin', 'true');
    }

    function exitAdminMode() {
        document.body.classList.remove('admin-mode');
        sessionStorage.removeItem('isAdmin');
    }

    // Login Triggers
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if already logged in, then toggle out
            if (document.body.classList.contains('admin-mode')) {
                exitAdminMode();
            } else {
                // Open password modal
                passwordModal.classList.add('active');
                adminPasswordInput.value = '';
                passwordError.innerText = '';
                adminPasswordInput.focus();
            }
        });
    }

    // Modal Cancel
    if (passwordCancelBtn) {
        passwordCancelBtn.addEventListener('click', () => {
            passwordModal.classList.remove('active');
        });
    }

    // Modal Submit
    function handlePasswordSubmit() {
        const entered = adminPasswordInput.value;
        if (entered === ADMIN_PASSWORD) {
            enterAdminMode();
            passwordModal.classList.remove('active');
        } else {
            passwordError.innerText = "Incorrect Password! Try again.";
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }

    if (passwordSubmitBtn) {
        passwordSubmitBtn.addEventListener('click', handlePasswordSubmit);
    }

    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handlePasswordSubmit();
            }
        });
    }

    // Logout Trigger
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', exitAdminMode);
    }

    // Initialize State & Engine
    loadState();
    renderAll();

    // Check if session had admin active previously
    if (sessionStorage.getItem('isAdmin') === 'true') {
        enterAdminMode();
    }

});
