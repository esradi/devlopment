import React from 'react';
import { 
    Book, 
    Video, 
    Users, 
    FileText, 
    ChevronRight, 
    Globe, 
    Medal, 
    ExternalLink,
    Search,
    PlayCircle,
    ArrowRight
} from 'lucide-react';
import './StudentResources.css';

const StudentResources = () => {
    const categories = [
        { id: 'guide', title: 'Candidature', icon: <FileText size={18} />, count: '12 Articles' },
        { id: 'interview', title: 'Entretien', icon: <Video size={18} />, count: '8 Videos' },
        { id: 'alumni', title: 'Réseau Alumni', icon: <Users size={18} />, count: '45 Posts' }
    ];

    const featured = [
        {
            title: "Réussir son entretien chez Sonatrach",
            desc: "Conseils exclusifs d'anciens stagiaires sur les tests techniques et la culture d'entreprise.",
            tag: "INTERVIEW",
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400"
        },
        {
            title: "Le Guide du CV Algérien 2026",
            desc: "Comment structurer son CV pour les entreprises locales et multinationales.",
            tag: "RESUME",
            image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400"
        }
    ];

    return (
        <div className="resources-page">
            <header className="resources-header">
                <div className="res-header-content">
                    <h1>Ressources & Carrière</h1>
                    <p>Tout ce dont vous avez besoin pour décrocher le stage de vos rêves.</p>
                </div>
                <div className="res-search">
                    <Search size={18} />
                    <input type="text" placeholder="Chercher un guide, un conseil..." />
                </div>
            </header>

            <div className="categories-row">
                {categories.map(cat => (
                    <div key={cat.id} className="cat-card">
                        <div className="cat-icon">{cat.icon}</div>
                        <div className="cat-info">
                            <h4>{cat.title}</h4>
                            <span>{cat.count}</span>
                        </div>
                        <ChevronRight size={16} />
                    </div>
                ))}
            </div>

            <div className="resources-grid">
                <div className="res-main">
                    <section className="res-section">
                        <div className="section-header">
                            <h2>À la une</h2>
                        </div>
                        <div className="featured-list">
                            {featured.map((item, idx) => (
                                <div key={idx} className="featured-card">
                                    <img src={item.image} alt={item.title} />
                                    <div className="feat-content">
                                        <span className="feat-tag">{item.tag}</span>
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                        <button className="btn-read">
                                            Lire l'article <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="res-section">
                        <div className="section-header">
                            <h2>Réseau Alumni</h2>
                        </div>
                        <div className="alumni-teaser card glass">
                            <div className="alumni-avatars">
                                <img src="https://i.pravatar.cc/150?u=1" alt="Alumni" />
                                <img src="https://i.pravatar.cc/150?u=2" alt="Alumni" />
                                <img src="https://i.pravatar.cc/150?u=3" alt="Alumni" />
                                <div className="plus-avatar">+42</div>
                            </div>
                            <div className="alumni-text">
                                <h4>Discutez avec des anciens</h4>
                                <p>Rejoignez la communauté Stag.io pour poser vos questions aux anciens stagiaires.</p>
                            </div>
                            <button className="btn-join">Rejoindre</button>
                        </div>
                    </section>
                </div>

                <aside className="res-sidebar">
                    <div className="card glass tools-card">
                        <h3>Outils Rapides</h3>
                        <div className="tool-item">
                            <div className="tool-icon"><Medal color="#fbbf24" size={18}/></div>
                            <div className="tool-text">
                                <h4>Certifications</h4>
                                <p>Boostez votre CV</p>
                            </div>
                        </div>
                        <div className="tool-item">
                            <div className="tool-icon"><PlayCircle color="#3b82f6" size={18}/></div>
                            <div className="tool-text">
                                <h4>Webinaires</h4>
                                <p>Direct chaque jeudi</p>
                            </div>
                        </div>
                    </div>

                    <div className="card dark newsletter-card">
                        <h4>Stag.io Tips</h4>
                        <p>Recevez les meilleures annonces par email.</p>
                        <input type="email" placeholder="votre@email.com" />
                        <button>S'abonner</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default StudentResources;
