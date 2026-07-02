'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Mobile Nav Hamburger state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Form Modal for Editing/Adding
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [submitCallback, setSubmitCallback] = useState(null);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('adminToken');
  };

  // Load portfolio database
  useEffect(() => {
    async function loadPortfolio() {
      // Load local version as immediate cache/fallback
      let cached = null;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('portfolio_data');
        if (saved) {
          try {
            cached = JSON.parse(saved);
            setPortfolioData(cached);
          } catch (e) {}
        }
      }

      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        if (data && !data.error) {
          // If no local version exists, use the server's seed data
          if (!cached) {
            setPortfolioData(data);
          }
        }
      } catch (err) {
        console.error("Error loading portfolio:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();

    // Check admin session
    if (sessionStorage.getItem('isAdmin') === 'true' || sessionStorage.getItem('adminToken')) {
      setIsAdmin(true);
    }

    // Scroll listener for header
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize AOS when data is loaded
  useEffect(() => {
    if (portfolioData) {
      AOS.init({
        duration: 1000,
        once: true,
        mirror: false
      });
    }
  }, [portfolioData]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('admin-mode', isAdmin);
    }
  }, [isAdmin]);

  // Save changes to backend helper
  const savePortfolioData = async (updatedData) => {
    // 1. Instantly update UI and client cache (crucial for Vercel persistence)
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_data', JSON.stringify(updatedData));
    }
    setPortfolioData(updatedData);
    setTimeout(() => {
      AOS.refresh();
    }, 100);

    // 2. Sync with backend API
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await fetch('/api/portfolio', {
        method: 'POST',
        headers,
        body: JSON.stringify(updatedData)
      });
    } catch (err) {
      console.warn("Backend save failed/bypassed (common on ephemeral hosts like Vercel). Changes saved locally.", err);
    }
  };

  // Auth actions
  const handleAdminToggle = (e) => {
    e.preventDefault();
    if (isAdmin) {
      setIsAdmin(false);
      sessionStorage.removeItem('isAdmin');
      sessionStorage.removeItem('adminToken');
    } else {
      setShowPasswordModal(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        sessionStorage.setItem('isAdmin', 'true');
        if (data.token) {
          sessionStorage.setItem('adminToken', data.token);
        }
        setShowPasswordModal(false);
      } else {
        setPasswordError('Incorrect Password! Try again.');
      }
    } catch (err) {
      setPasswordError('Server connection failed.');
    }
  };

  // Modal open helper
  const openEditModal = (title, fields, onSubmit) => {
    setModalTitle(title);
    setFormFields(fields);
    
    // Set initial values
    const initialFormValues = {};
    fields.forEach(f => {
      initialFormValues[f.name] = f.value;
    });
    setFormData(initialFormValues);
    setSubmitCallback(() => onSubmit);
    setShowFormModal(true);
  };

  const handleFormFieldChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (submitCallback) {
      submitCallback(formData);
    }
    setShowFormModal(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0a0f1e',
        color: '#a78bfa',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Loading portfolio...
      </div>
    );
  }

  // Deconstruct portfolio parts
  const { hero, about, skills, projects, education, certifications } = portfolioData || {};

  return (
    <div className={isAdmin ? 'admin-mode' : ''}>
      
      {/* Background Video Container */}
      <div className="background-video-container">
        <video autoPlay loop muted playsInline>
          <source src="/images/Background_Video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Header */}
      <header style={{
        backgroundColor: scrolled ? 'rgba(10, 15, 30, 0.85)' : 'rgba(15, 23, 42, 0.65)',
        boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.3)' : 'none'
      }}>
        <nav className="navbar">
          <a href="#home" className="nav-logo">Gobinath S</a>
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="nav-item"><a href="#home" className="nav-link">Home</a></li>
            <li className="nav-item"><a href="#about" className="nav-link">About</a></li>
            <li className="nav-item"><a href="#skills" className="nav-link">Skills</a></li>
            <li className="nav-item"><a href="#projects" className="nav-link">Projects</a></li>
            <li className="nav-item"><a href="#education" className="nav-link">Education</a></li>
            <li className="nav-item"><a href="#certifications" className="nav-link">Certifications</a></li>
            <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
            <li className="nav-item">
              <a href="#" className="nav-link admin-trigger" onClick={handleAdminToggle}>
                <i className={`fa-solid ${isAdmin ? 'fa-lock-open' : 'fa-lock'}`}></i> {isAdmin ? 'Logout' : 'Admin'}
              </a>
            </li>
          </ul>
          <div className="nav-right">
            <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content">
            <div className="hero-text" style={{ position: 'relative' }}>
              <h1 id="hero-title">
                {hero?.title}
                {isAdmin && (
                  <button className="inline-edit-trigger" onClick={() => openEditModal('Edit Hero Title', [
                    { name: 'title', label: 'Title', type: 'text', value: hero.title }
                  ], (data) => savePortfolioData({ ...portfolioData, hero: { ...hero, title: data.title } }))}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                )}
              </h1>
              <h3 id="hero-subtitle">
                {hero?.subtitle}
                {isAdmin && (
                  <button className="inline-edit-trigger" onClick={() => openEditModal('Edit Hero Subtitle', [
                    { name: 'subtitle', label: 'Subtitle', type: 'text', value: hero.subtitle }
                  ], (data) => savePortfolioData({ ...portfolioData, hero: { ...hero, subtitle: data.subtitle } }))}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                )}
              </h3>
              <p id="hero-desc" data-aos="fade-up" data-aos-delay="200">
                {hero?.desc}
                {isAdmin && (
                  <button className="inline-edit-trigger" onClick={() => openEditModal('Edit Hero Description', [
                    { name: 'desc', label: 'Description', type: 'textarea', value: hero.desc }
                  ], (data) => savePortfolioData({ ...portfolioData, hero: { ...hero, desc: data.desc } }))}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                )}
              </p>
              <a href={`/${hero?.cvLink}`} download className="btn" data-aos="fade-up" data-aos-delay="400">Download CV</a>
              
              {isAdmin && (
                <button className="block-edit-trigger" onClick={() => openEditModal('Edit Hero Media & Link', [
                  { name: 'cvLink', label: 'Resume/CV File Path or URL', type: 'text', value: hero.cvLink },
                  { name: 'imgSrc', label: 'Profile Image Path or URL', type: 'text', value: hero.imgSrc }
                ], (data) => savePortfolioData({ ...portfolioData, hero: { ...hero, cvLink: data.cvLink, imgSrc: data.imgSrc } }))}>
                  <i className="fa-solid fa-image"></i> Edit Image & CV
                </button>
              )}
            </div>
            <div className="hero-image" data-aos="fade-left">
              <img id="hero-img" src={`/${hero?.imgSrc}`} alt="Gobinath S Profile Picture" />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section content-section" data-aos="fade-up">
          <h2 className="section-title">About Me</h2>
          <div className="about-container" style={{ position: 'relative' }}>
            <p id="about-text">
              {about?.text}
              {isAdmin && (
                <button className="inline-edit-trigger" onClick={() => openEditModal('Edit About Me', [
                  { name: 'text', label: 'About Text', type: 'textarea', value: about.text }
                ], (data) => savePortfolioData({ ...portfolioData, about: { text: data.text } }))}>
                  <i className="fa-solid fa-pen"></i> Edit
                </button>
              )}
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="skills-section content-section" data-aos="fade-up">
          <h2 className="section-title">Skills & Profile</h2>
          <div className="skills-layout">
            
            {/* Tech Skills */}
            <div className="tech-skills-column">
              <h3>Technical Skills</h3>
              <div className="skills-grid" id="skills-grid-container">
                {skills?.technical.map((skill, index) => (
                  <div key={index} className="skill-card" data-aos="zoom-in" data-aos-delay={index * 50}>
                    <i className={skill.icon}></i>
                    <h3>{skill.name}</h3>
                    {isAdmin && (
                      <div className="item-admin-overlay">
                        <button className="admin-card-btn admin-btn-edit" onClick={() => openEditModal('Edit Technical Skill', [
                          { name: 'name', label: 'Skill Name', type: 'text', value: skill.name },
                          { name: 'icon', label: 'Icon Class (e.g. fa-brands fa-html5)', type: 'text', value: skill.icon }
                        ], (data) => {
                          const updated = [...skills.technical];
                          updated[index] = data;
                          savePortfolioData({ ...portfolioData, skills: { ...skills, technical: updated } });
                        })}><i className="fa-solid fa-pen"></i></button>
                        <button className="admin-card-btn admin-btn-delete" onClick={() => {
                          if (confirm("Delete this technical skill?")) {
                            const updated = skills.technical.filter((_, i) => i !== index);
                            savePortfolioData({ ...portfolioData, skills: { ...skills, technical: updated } });
                          }
                        }}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    )}
                  </div>
                ))}

                {isAdmin && (
                  <div className="add-new-card" onClick={() => openEditModal('Add Technical Skill', [
                    { name: 'name', label: 'Skill Name', type: 'text', value: '' },
                    { name: 'icon', label: 'Icon Class', type: 'text', value: 'fa-solid fa-laptop-code' }
                  ], (data) => {
                    const updated = [...skills.technical, data];
                    savePortfolioData({ ...portfolioData, skills: { ...skills, technical: updated } });
                  })}>
                    <i className="fa-solid fa-circle-plus"></i>
                    <span>Add Skill</span>
                  </div>
                )}
              </div>
            </div>

            {/* Side Column Skills */}
            <div className="side-skills-column">
              
              {/* Soft Skills */}
              <div className="side-card soft-skills-card" data-aos="fade-left">
                <h3><i className="fa-solid fa-user-gear"></i> Soft Skills</h3>
                <ul id="soft-skills-list">
                  {skills?.soft.map((item, index) => (
                    <li key={index} style={{ position: 'relative' }}>
                      <i className="fa-solid fa-check"></i> {item}
                      {isAdmin && (
                        <div className="item-admin-overlay">
                          <button className="admin-card-btn admin-btn-edit" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => openEditModal('Edit Soft Skill', [
                            { name: 'name', label: 'Soft Skill Name', type: 'text', value: item }
                          ], (data) => {
                            const updated = [...skills.soft];
                            updated[index] = data.name;
                            savePortfolioData({ ...portfolioData, skills: { ...skills, soft: updated } });
                          })}><i className="fa-solid fa-pen"></i></button>
                          <button className="admin-card-btn admin-btn-delete" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => {
                            if (confirm("Delete this soft skill?")) {
                              const updated = skills.soft.filter((_, i) => i !== index);
                              savePortfolioData({ ...portfolioData, skills: { ...skills, soft: updated } });
                            }
                          }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                      )}
                    </li>
                  ))}
                  {isAdmin && (
                    <li className="admin-only">
                      <button className="inline-edit-trigger" style={{ display: 'inline-flex' }} onClick={() => openEditModal('Add Soft Skill', [
                        { name: 'name', label: 'Soft Skill Name', type: 'text', value: '' }
                      ], (data) => {
                        if (data.name.trim()) {
                          const updated = [...skills.soft, data.name.trim()];
                          savePortfolioData({ ...portfolioData, skills: { ...skills, soft: updated } });
                        }
                      })}><i className="fa-solid fa-plus"></i> Add Soft Skill</button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Interests */}
              <div className="side-card interests-card" data-aos="fade-left" data-aos-delay="100">
                <h3><i className="fa-solid fa-heart"></i> Interests</h3>
                <ul id="interests-list">
                  {skills?.interests.map((item, index) => (
                    <li key={index} style={{ position: 'relative' }}>
                      <i className="fa-solid fa-check"></i> {item}
                      {isAdmin && (
                        <div className="item-admin-overlay">
                          <button className="admin-card-btn admin-btn-edit" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => openEditModal('Edit Interest', [
                            { name: 'name', label: 'Interest', type: 'text', value: item }
                          ], (data) => {
                            const updated = [...skills.interests];
                            updated[index] = data.name;
                            savePortfolioData({ ...portfolioData, skills: { ...skills, interests: updated } });
                          })}><i className="fa-solid fa-pen"></i></button>
                          <button className="admin-card-btn admin-btn-delete" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => {
                            if (confirm("Delete this interest?")) {
                              const updated = skills.interests.filter((_, i) => i !== index);
                              savePortfolioData({ ...portfolioData, skills: { ...skills, interests: updated } });
                            }
                          }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                      )}
                    </li>
                  ))}
                  {isAdmin && (
                    <li className="admin-only">
                      <button className="inline-edit-trigger" style={{ display: 'inline-flex' }} onClick={() => openEditModal('Add Interest', [
                        { name: 'name', label: 'Interest', type: 'text', value: '' }
                      ], (data) => {
                        if (data.name.trim()) {
                          const updated = [...skills.interests, data.name.trim()];
                          savePortfolioData({ ...portfolioData, skills: { ...skills, interests: updated } });
                        }
                      })}><i className="fa-solid fa-plus"></i> Add Interest</button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Languages */}
              <div className="side-card languages-card" data-aos="fade-left" data-aos-delay="200">
                <h3><i className="fa-solid fa-language"></i> Languages</h3>
                <ul id="languages-list">
                  {skills?.languages.map((item, index) => {
                    let name = item;
                    let level = '';
                    const match = item.match(/<strong>(.*?)<\/strong>(?:\s*-\s*(.*))?/);
                    if (match) {
                      name = match[1];
                      level = match[2] || '';
                    }
                    return (
                      <li key={index} style={{ position: 'relative' }}>
                        <span dangerouslySetInnerHTML={{ __html: item }}></span>
                        {isAdmin && (
                          <div className="item-admin-overlay">
                            <button className="admin-card-btn admin-btn-edit" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => openEditModal('Edit Language', [
                              { name: 'name', label: 'Language Name', type: 'text', value: name },
                              { name: 'level', label: 'Fluency Level (e.g. Native, Professional)', type: 'text', value: level }
                            ], (data) => {
                              if (data.name.trim()) {
                                const formatted = `<strong>${data.name.trim()}</strong>` + (data.level.trim() ? ` - ${data.level.trim()}` : '');
                                const updated = [...skills.languages];
                                updated[index] = formatted;
                                savePortfolioData({ ...portfolioData, skills: { ...skills, languages: updated } });
                              }
                            })}><i className="fa-solid fa-pen"></i></button>
                            <button className="admin-card-btn admin-btn-delete" style={{ width: 24, height: 24, fontSize: '0.7rem' }} onClick={() => {
                              if (confirm("Delete this language?")) {
                                const updated = skills.languages.filter((_, i) => i !== index);
                                savePortfolioData({ ...portfolioData, skills: { ...skills, languages: updated } });
                              }
                            }}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {isAdmin && (
                    <li className="admin-only">
                      <button className="inline-edit-trigger" style={{ display: 'inline-flex' }} onClick={() => openEditModal('Add Language', [
                        { name: 'name', label: 'Language Name', type: 'text', value: '' },
                        { name: 'level', label: 'Fluency Level', type: 'text', value: '' }
                      ], (data) => {
                        if (data.name.trim()) {
                          const formatted = `<strong>${data.name.trim()}</strong>` + (data.level.trim() ? ` - ${data.level.trim()}` : '');
                          const updated = [...skills.languages, formatted];
                          savePortfolioData({ ...portfolioData, skills: { ...skills, languages: updated } });
                        }
                      })}><i className="fa-solid fa-plus"></i> Add Language</button>
                    </li>
                  )}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="projects-section content-section" data-aos="fade-up">
          <h2 className="section-title">Projects Done</h2>
          <div className="projects-grid" id="projects-grid-container">
            {projects?.map((proj, index) => (
              <div key={index} className="project-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="project-header">
                  <span className="project-year">{proj.year}</span>
                  <span className="project-org">{proj.org}</span>
                </div>
                <h3>{proj.title}</h3>
                <p className="project-desc">{proj.desc}</p>
                <div className="tech-stack">
                  {proj.tech.map((t, idx) => <span key={idx}>{t}</span>)}
                </div>
                {proj.link && (
                  <a href={proj.link} target="_blank" className="project-link">
                    <span>Visit Live Demo</span> <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                )}
                {isAdmin && (
                  <div className="item-admin-overlay">
                    <button className="admin-card-btn admin-btn-edit" onClick={() => openEditModal('Edit Project', [
                      { name: 'year', label: 'Year', type: 'text', value: proj.year },
                      { name: 'org', label: 'Organization/Institution', type: 'text', value: proj.org },
                      { name: 'title', label: 'Project Title', type: 'text', value: proj.title },
                      { name: 'desc', label: 'Description', type: 'textarea', value: proj.desc },
                      { name: 'tech', label: 'Tech Stack (comma separated)', type: 'text', value: proj.tech.join(', ') },
                      { name: 'link', label: 'Live Link', type: 'text', value: proj.link }
                    ], (data) => {
                      const updated = [...projects];
                      updated[index] = {
                        year: data.year,
                        org: data.org,
                        title: data.title,
                        desc: data.desc,
                        tech: data.tech.split(',').map(t => t.trim()).filter(t => t.length > 0),
                        link: data.link
                      };
                      savePortfolioData({ ...portfolioData, projects: updated });
                    })}><i className="fa-solid fa-pen"></i></button>
                    <button className="admin-card-btn admin-btn-delete" onClick={() => {
                      if (confirm("Delete this project?")) {
                        const updated = projects.filter((_, i) => i !== index);
                        savePortfolioData({ ...portfolioData, projects: updated });
                      }
                    }}><i className="fa-solid fa-trash"></i></button>
                  </div>
                )}
              </div>
            ))}

            {isAdmin && (
              <div className="add-new-card" onClick={() => openEditModal('Add Project', [
                { name: 'year', label: 'Year', type: 'text', value: new Date().getFullYear().toString() },
                { name: 'org', label: 'Organization/Institution', type: 'text', value: '' },
                { name: 'title', label: 'Project Title', type: 'text', value: '' },
                { name: 'desc', label: 'Description', type: 'textarea', value: '' },
                { name: 'tech', label: 'Tech Stack (comma separated)', type: 'text', value: '' },
                { name: 'link', label: 'Live Link', type: 'text', value: '' }
              ], (data) => {
                const updated = [...projects, {
                  year: data.year,
                  org: data.org,
                  title: data.title,
                  desc: data.desc,
                  tech: data.tech.split(',').map(t => t.trim()).filter(t => t.length > 0),
                  link: data.link
                }];
                savePortfolioData({ ...portfolioData, projects: updated });
              })}>
                <i className="fa-solid fa-circle-plus"></i>
                <span>Add Project</span>
              </div>
            )}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="education-section content-section" data-aos="fade-up">
          <h2 className="section-title">Education</h2>
          <div className="timeline" id="education-timeline-container">
            {education?.map((edu, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="timeline-item" data-aos={isEven ? 'fade-right' : 'fade-left'} data-aos-delay={!isEven ? '100' : ''}>
                  <div className="timeline-content">
                    <span className="timeline-date">{edu.date}</span>
                    <h3>{edu.degree}</h3>
                    <p className="school-name">{edu.school}</p>
                    <span className="gpa-badge">{edu.grade}</span>
                  </div>
                  {isAdmin && (
                    <div className="item-admin-overlay">
                      <button className="admin-card-btn admin-btn-edit" onClick={() => openEditModal('Edit Education Milestone', [
                        { name: 'date', label: 'Duration/Date', type: 'text', value: edu.date },
                        { name: 'degree', label: 'Degree/Course', type: 'text', value: edu.degree },
                        { name: 'school', label: 'School Name', type: 'text', value: edu.school },
                        { name: 'grade', label: 'Grade/GPA', type: 'text', value: edu.grade }
                      ], (data) => {
                        const updated = [...education];
                        updated[index] = data;
                        savePortfolioData({ ...portfolioData, education: updated });
                      })}><i className="fa-solid fa-pen"></i></button>
                      <button className="admin-card-btn admin-btn-delete" onClick={() => {
                        if (confirm("Delete this education milestone?")) {
                          const updated = education.filter((_, i) => i !== index);
                          savePortfolioData({ ...portfolioData, education: updated });
                        }
                      }}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  )}
                </div>
              );
            })}

            {isAdmin && (
              <div className="add-new-card" style={{ maxWidth: '850px', margin: '2rem auto 0', minHeight: '100px' }} onClick={() => openEditModal('Add Education Milestone', [
                { name: 'date', label: 'Duration/Date', type: 'text', value: '' },
                { name: 'degree', label: 'Degree/Course', type: 'text', value: '' },
                { name: 'school', label: 'School Name', type: 'text', value: '' },
                { name: 'grade', label: 'Grade/GPA', type: 'text', value: '' }
              ], (data) => {
                const updated = [...education, data];
                savePortfolioData({ ...portfolioData, education: updated });
              })}>
                <i className="fa-solid fa-circle-plus"></i>
                <span>Add Education Milestone</span>
              </div>
            )}
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="certifications-section content-section" data-aos="fade-up">
          <h2 className="section-title">Certifications</h2>
          <div className="cert-grid" id="certifications-grid-container">
            {certifications?.map((cert, index) => (
              <div key={index} className="cert-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <h4>{cert.title}</h4>
                <p className="cert-org">{cert.org}</p>
                <span className="cert-year">{cert.year}</span>
                {cert.img && <img src={`/${cert.img}`} alt={`${cert.title} Certificate`} />}
                {isAdmin && (
                  <div className="item-admin-overlay">
                    <button className="admin-card-btn admin-btn-edit" onClick={() => openEditModal('Edit Certification', [
                      { name: 'title', label: 'Title', type: 'text', value: cert.title },
                      { name: 'org', label: 'Organization', type: 'text', value: cert.org },
                      { name: 'year', label: 'Year', type: 'text', value: cert.year },
                      { name: 'img', label: 'Image URL or File Path', type: 'text', value: cert.img }
                    ], (data) => {
                      const updated = [...certifications];
                      updated[index] = data;
                      savePortfolioData({ ...portfolioData, certifications: updated });
                    })}><i className="fa-solid fa-pen"></i></button>
                    <button className="admin-card-btn admin-btn-delete" onClick={() => {
                      if (confirm("Delete this certification?")) {
                        const updated = certifications.filter((_, i) => i !== index);
                        savePortfolioData({ ...portfolioData, certifications: updated });
                      }
                    }}><i className="fa-solid fa-trash"></i></button>
                  </div>
                )}
              </div>
            ))}

            {isAdmin && (
              <div className="add-new-card" onClick={() => openEditModal('Add Certification', [
                { name: 'title', label: 'Title', type: 'text', value: '' },
                { name: 'org', label: 'Organization', type: 'text', value: '' },
                { name: 'year', label: 'Year', type: 'text', value: new Date().getFullYear().toString() },
                { name: 'img', label: 'Image Path', type: 'text', value: 'images/' }
              ], (data) => {
                const updated = [...certifications, data];
                savePortfolioData({ ...portfolioData, certifications: updated });
              })}>
                <i className="fa-solid fa-circle-plus"></i>
                <span>Add Certification</span>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section content-section" data-aos="fade-up">
          <h2 className="section-title">Contact Me</h2>
          <div className="contact-container">
            <div className="contact-grid">
              <div className="contact-card" data-aos="zoom-in">
                <i className="fa-solid fa-envelope"></i>
                <h3>Email</h3>
                <p><a href="mailto:gobinathbsccs@gmail.com">gobinathbsccs@gmail.com</a></p>
              </div>
              <div className="contact-card" data-aos="zoom-in" data-aos-delay="100">
                <i className="fa-solid fa-phone"></i>
                <h3>Phone</h3>
                <p><a href="tel:+919790021257">+91 9790021257</a></p>
              </div>
              <div className="contact-card" data-aos="zoom-in" data-aos-delay="200">
                <i className="fa-solid fa-location-dot"></i>
                <h3>Address</h3>
                <p>Maduganchavadi, Salem - 637103</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="social-links">
          <a href="https://www.linkedin.com/in/gobinath008" target="_blank" aria-label="LinkedIn"><i className="fa-brands fa-linkedin"></i></a>
          <a href="https://github.com/Gobinath1008" target="_blank" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
        </div>
        <p>Copyright © 2026 Gobinath S. All rights reserved.</p>
        <br />
        <p className="footer-note">Built with ❤️ by Gobinath S</p>
      </footer>

      {/* Admin Status Bar */}
      <div id="admin-status-bar" className="admin-status-bar">
        <div className="admin-status-content">
          <span className="admin-badge"><i className="fa-solid fa-user-shield"></i> Admin Mode Active</span>
          <div className="admin-status-actions">
            <button id="admin-logout-btn" className="admin-btn-logout" onClick={() => {
              setIsAdmin(false);
              sessionStorage.removeItem('isAdmin');
              sessionStorage.removeItem('adminToken');
            }}><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <div className={`admin-modal ${showPasswordModal ? 'active' : ''}`}>
        <div className="admin-modal-content password-card">
          <h3><i className="fa-solid fa-shield-halved"></i> Admin Login</h3>
          <p>Please enter the administrator password to access dashboard controls.</p>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              autoComplete="current-password" 
            />
            {passwordError && <span className="error-msg">{passwordError}</span>}
          </div>
          <div className="modal-buttons">
            <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePasswordSubmit}>Login</button>
          </div>
        </div>
      </div>

      {/* Admin Form Modal for Add/Edit */}
      <div className={`admin-modal ${showFormModal ? 'active' : ''}`}>
        <div className="admin-modal-content">
          <span className="close-btn" onClick={() => setShowFormModal(false)}>&times;</span>
          <h3>{modalTitle}</h3>
          <form onSubmit={handleFormSubmit}>
            <div id="dynamic-form-fields">
              {formFields.map((field) => (
                <div key={field.name} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={formData[field.name] || ''} 
                      onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                      required
                    />
                  ) : (
                    <input 
                      type={field.type} 
                      value={formData[field.name] || ''} 
                      onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
