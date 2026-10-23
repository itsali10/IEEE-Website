import React, { useState, useRef, useEffect } from 'react'
import HeroWithSlope from '../components/HeroWithSlope/HeroWithSlope'
import EventsCard from '../components/EventsCard/EventsCard'
import "../css/eventsStyles.css"
import eg1 from "../assets/eg1.jpg"
import eg2 from "../assets/eg2.jpg"
import eg3 from "../assets/eg14.jpg"
import ventus2 from "../assets/ventus2.jpg"
import ventus1 from "../assets/ventus1.jpg"
import reepe0 from "../assets/reepe0.jpg"
import reepe1 from "../assets/reepe1.JPG"
import reepe2 from "../assets/reepe2.JPG"
import reepe3 from "../assets/reepe3.JPG"
import reepe4 from "../assets/reepe4.JPG"
import reepe5 from "../assets/reepe5.JPG"
import reepe6 from "../assets/reepe6.JPG"
import reepe2026_1 from "../assets/reepe2026-1.jpeg"
import reepe2026_2 from "../assets/reepe2026-2.jpeg"
import reepe2026_3 from "../assets/reepe2026-3.jpeg"
import reepe2026_4 from "../assets/reepe2026-4.jpeg"
import reepe2026_5 from "../assets/reepe2026-5.jpeg"
import reepe2026_6 from "../assets/reepe2026-6.jpeg"
import reepe2026_7 from "../assets/reepe2026-7.jpeg"
import unitour1 from "../assets/elsewedy/elsewedy1.jpeg"
import unitour2 from "../assets/elsewedy/elsewedy2.jpeg"
import unitour3 from "../assets/elsewedy/elsewedy3.jpeg"
import unitour4 from "../assets/elsewedy/elsewedy4.jpeg"
import unitour5 from "../assets/elsewedy/elsewedy5.jpeg"
import unitour6 from "../assets/elsewedy/elsewedy6.jpeg"
import unitour7 from "../assets/elsewedy/elsewedy7.jpeg"
import unitour8 from "../assets/elsewedy/elsewedy8.jpeg"
import unitour9 from "../assets/elsewedy/elsewedy9.jpeg"
import unitour10 from "../assets/elsewedy/elsewedy10.jpeg"
import unitour11 from "../assets/elsewedy/elsewedy11.jpeg"
import unitour12 from "../assets/elsewedy/elsewedy12.jpeg"
import ramadan1 from "../assets/ramadan1.jpg"
import camp1 from "../assets/camp1.jpg"
import camp2 from "../assets/camp2.jpg"
import camp3 from "../assets/camp3.jpg"
import camp4 from "../assets/camp4.jpg"
import camp5 from "../assets/camp5.jpg"
import camp6 from "../assets/camp6.jpg"
import camp7 from "../assets/camp7.jpg"
import camp8 from "../assets/camp8.jpg"
import camp9 from "../assets/camp9.jpg"
import camp10 from "../assets/camp10.jpg"
import hv1 from "../assets/hv1.jpg"
import hv2 from "../assets/hv2.jpg"
import hv3 from "../assets/hv3.jpg"
import hv4 from "../assets/hv4.JPG"
import vois1 from "../assets/vois1.jpg"
import opening1 from "../assets/opening1.jpg"
import opening2 from "../assets/opening2.jpg"
import opening3 from "../assets/opening3.jpg"
import solar1 from "../assets/solar1.jpg"
import solar2 from "../assets/solar2.jpg"
import solar3 from "../assets/solar3.jpg"
import solar4 from "../assets/solar4.jpg"
import solar5 from "../assets/solar5.jpg"
import gap1 from "../assets/gap1.jpg"
import gap2 from "../assets/gap2.jpg"
import cc1 from "../assets/cc1.jpg"
import cc2 from "../assets/cc2.jpg"
import cc3 from "../assets/cc3.jpg"
import cc4 from "../assets/cc4.jpg"
import cc5 from "../assets/cc5.jpg"
import cap1 from "../assets/cap1.jpg"
import cap2 from "../assets/cap2.jpg"
import cap3 from "../assets/cap3.jpg"
import cap4 from "../assets/cap4.jpg"
import cap5 from "../assets/cap5.jpg"
import cap6 from "../assets/cap6.jpg"
import cad1 from "../assets/cad1.jpg"
import cad2 from "../assets/cad2.jpg"
import cad3 from "../assets/cad3.jpg"
import cad4 from "../assets/cad4.jpg"
import cad5 from "../assets/cad5.jpg"
import cad6 from "../assets/cad6.jpg"
import voiss1 from "../assets/voiss1.jpg"
import voiss2 from "../assets/voiss2.jpg"
import voiss3 from "../assets/voiss3.jpg"
import voiss4 from "../assets/voiss4.jpg"
import voiss5 from "../assets/voiss5.jpg"
import voiss6 from "../assets/voiss6.jpg"
import repe1 from "../assets/repe1.JPG"
import repe2 from "../assets/repe2.JPG"
import repe3 from "../assets/repe3.JPG"
import repe4 from "../assets/repe4.JPG"
import repe5 from "../assets/repe5.JPG"
import repe6 from "../assets/repe6.JPG"
import repe7 from "../assets/repe7.JPG"
import repe8 from "../assets/repe8.JPG"
import ramadan2 from "../assets/ramadan2.jpg"
import openingg1 from "../assets/openingg1.jpg"
import openingg2 from "../assets/openingg2.JPG"
import openingg3 from "../assets/openingg3.JPG"
import egg1 from "../assets/egg1.jpg"
import egg2 from "../assets/egg2.jpg"
import egg3 from "../assets/egg3.jpg"
import egg4 from "../assets/egg4.jpg"
import egg5 from "../assets/egg5.jpg"
import egg6 from "../assets/egg6.jpg"
import egg7 from "../assets/egg7.jpg"
import egg8 from "../assets/egg8.jpg"
import egg9 from "../assets/egg9.jpg"
import egg10 from "../assets/egg10.jpg"
import egg11 from "../assets/egg11.jpg"
import egg12 from "../assets/egg12.jpg"
import { motion , useScroll } from 'framer-motion'

const eventsData = [
    {
        eventName: "REEPE",
        eventDesc: "The 8th International Youth Conference on Radio Electronics, Electrical and Power Engineering (IEEE REEPE 2026) was proudly hosted at our university AASTMT Cairo as the official venue for Cairo, held in parallel with Moscow Power Engineering Institute (MPEI) and the American University of Sharjah (AUS), bringing together a diverse community of students, researchers, and industry professionals.\n\nThroughout the conference, participants showcased their papers through presentations covering the latest advancements in electrical engineering, power systems, and radio electronics. The event provided a valuable platform for knowledge exchange, collaboration, and the exchange of innovative ideas.\n\nAs a hosting branch, we were honored to contribute to the success of this international conference and to represent our community on a global academic stage.",
        images: [reepe2026_1, reepe2026_2, reepe2026_3, reepe2026_4, reepe2026_5, reepe2026_6, reepe2026_7],
        season: "Event",
        eventDate: "1-04-2026",
        eventLocation: "AASTMT Cairo",
        year: 2026,
        universityLinks: [
            { name: "Arab Academy for Science, Technology and Maritime Transport", url: "https://aast.edu/en/" }
        ]
    },
    {
        eventName: "El Sewedy Visit 2026",
        eventDesc: "El Sewedy Visit 2026 was a 2-day technical workshop organized in collaboration with Elsewedy Electric Cable Accessories and IEEE SAC Egypt, held under the theme \"Engineering the Future — Bridging Academia to Industry.\"\n\nDay 1 kicked off with a warm welcome and an introduction to Elsewedy Electric Group and its Cable Accessories division, followed by in-depth theoretical sessions covering the Fundamentals of Electrical Power Systems, a comparison of Underground Cables vs. Overhead Transmission Lines, and a deep dive into Medium Voltage Cable construction, layers, and accessory technologies. The day wrapped up with a session on Electrical Tests and International Standards, complete with a Q&A.\n\nDay 2 shifted to hands-on practice — participants began with a recap and safety briefing before getting into tool identification, PPE usage, and cable preparation. They then moved through Joint Installation and Termination & Elbow Installation workshops, gaining real-world experience with industry-grade equipment. The event concluded with a certificate ceremony, feedback session, and closing remarks, leaving participants with practical skills and a deeper connection to the electrical power industry.",
        images: [unitour1, unitour2, unitour3, unitour4, unitour5, unitour6, unitour7, unitour8, unitour9, unitour10, unitour11, unitour12],
        season: "Event",
        eventDate: "15-04-2026",
        eventLocation: "AAST Engineering Building A",
        year: 2026,
        universityLinks: [
            { name: "Arab Academy for Science, Technology and Maritime Transport", url: "https://aast.edu/en/" }
        ]
    },
    {
        eventName: "Ventus",
        eventDesc: "Participants had the opportunity to engage in a hands-on demo session of the GWO BTT Electrical module, fully experienced through virtual reality at the AAST Engineering Building.Hosted by Ventus Academy, the session brought global-standard wind energy training to Egypt and the MENA region, offering a cutting-edge introduction to the world of renewable energy and electrical systems.",
        images: [ventus1, ventus2],
        season: "Session",
        eventDate: "16-04-2025",
        eventLocation: "AAST Engineering Building B",
        year: 2025
    },
    {
        eventName: "Engineering Gateway",
        eventDesc: "Designed specifically for students in grades 10 to 12, the program featured hands-on workshops in circuits, Arduino, Python, and mechanical design—all paired with fun, engaging activities to introduce high schoolers to the exciting world of engineering.",
        images: [eg1, eg2, eg3],
        season: "Event",
        eventDate: "06-12-2024",
        eventLocation: "AAST Engineering Building A, Gamal Mokhtar Hall",
        year: 2025
    },
    {
        eventName: "REEPE 7th",
        eventDesc: "The REEPE Conference is a prestigious event that brings together engineers, designers, industry professionals, and university researchers to discuss power and energy systems, address environmental challenges, and engage in networking and knowledge sharing.",
        images: [reepe0, reepe1, reepe2, reepe3, reepe4, reepe5, reepe6],
        season: "Event",
        eventDate: "15-04-2025",
        eventLocation: "AAST Engineering Building A, Gamal Mokhtar Hall",
        year: 2025
    },
    {
        eventName: "Ramadan Iftar",
        eventDesc: "In Ramadan, we came together for a warm iftar, followed by a fun night of padel matches and quality time with friends. From sharing a delicious meal to enjoying friendly games and hanging out afterwards, it was a memorable evening full of connection, laughter, and good vibes.",
        images: [ramadan1],
        season: "Other",
        eventDate: "16-03-2025",
        eventLocation: "Engineers Club, New Cairo",
        year: 2025
    },
    {
        eventName: "CAMP",
        eventDesc: "Participants joined us for hands-on sessions in Circuits, Arduino, Mechanical Design, and Python. It was a valuable opportunity to explore different fields and discover the one that excited them most!",
        images: [camp1, camp2, camp3, camp4, camp5, camp6, camp7, camp8, camp9, camp10],
        season: "Session",
        eventDate: "30-10-2025",
        eventLocation: "AAST Engineering Building A",
        year: 2025
    },
    {
        eventName: "High Voltage",
        eventDesc: "Dive into the core concepts of electrical networks, substation equipment, single-line diagrams (SLDs), and the various types of high-voltage substations. Enhance your understanding and uncover the critical infrastructure that powers modern energy systems!",
        images: [hv1, hv2, hv3, hv4],
        season: "Session",
        eventDate: "27-11-2025",
        eventLocation: "AAST Engineering Building B",
        year: 2025
    },
    {
        eventName: "_VOIS Site Visit",
        eventDesc: "Students visited VOIS for an engaging tour that showcased the company’s tech-driven operations and innovative work culture. They explored real-world applications in IT and business services, while also learning about internship and career opportunities.",
        images: [vois1],
        season: "Other",
        eventDate: "27-11-2025",
        eventLocation: "Smart Village",
        year: 2025
    },
    {
        eventName: "Opening",
        eventDesc: "We proudly introduced our new board members, the passionate team leading us into this next chapter. We also took a moment to reflect on our past achievements, highlighting the milestones, successful events, and community impact we've made together.",
        images: [opening1, opening2, opening3],
        season: "Other",
        eventDate: "23-10-2025",
        eventLocation: "AAST Engineering Building B",
        year: 2025
    },
    {
        eventName: "Solar",
        eventDesc: "In this interactive workshop, participants explored the basics of solar energy—how sunlight is converted into electricity, the different types of solar panels available, and how to design systems for both on-grid and off-grid needs. They also gained hands-on experience using software to create their own solar setups, making it a fun and practical introduction to sustainable energy solutions.",
        images: [solar1, solar2, solar3, solar4, solar5],
        season: "Session",
        eventDate: "15-5-2024",
        eventLocation: "AAST Engineering Building B",
        year: 2024
    },
    {
        eventName: "GAP",
        eventDesc: "GAP is an interactive event designed to bridge the gap between academic life and the professional world. Through expert talks, hands-on workshops, and real-world simulations, students gain insight into industry expectations, develop practical skills, and connect with professionals across various fields. Whether you're preparing for internships, your first job, or launching a startup, GAP empowers you with the tools and mindset needed to confidently transition from the classroom to your career.",
        images: [gap1, gap2],
        season: "Session",
        eventDate: "3-3-2024",
        eventLocation: "AAST Engineering Building A",
        year: 2024
    },
    {
        eventName: "Classic Control",
        eventDesc: "In this session, participants learned the basics of control systems and automation. They explored how to design start-stop and forward-reverse circuits, and gained a clear understanding of power circuits, control circuits, and protection devices.",
        images: [cc1,cc2,cc3,cc4,cc5],
        season: "Session",
        eventDate: "22-4-2024",
        eventLocation: "AAST Engineering Building B",
        year: 2024
    },
    {
        eventName: "CAP",
        eventDesc: "The CAP Program offered hands-on workshops in Circuits, Arduino, and Python, helping participants build technical skills through practical projects and real-world applications.",
        images: [cap1,cap2,cap3,cap4,cap5,cap6],
        season: "Session",
        eventDate: "29-11-2023",
        eventLocation: "AAST Engineering Building B",
        year: 2024
    },
    {
        eventName: "CAD",
        eventDesc: "In our recent beginner-friendly AutoCAD event, participants took their first steps into the world of 2D design using the industry-standard software. Tailored for electrical power engineers, the session highlighted how AutoCAD streamlines the design, analysis, and documentation of electrical systems—ensuring safer and more efficient power infrastructure. It was the perfect opportunity to explore essential tools and kickstart practical design skills.",
        images: [cad1,cad2,cad3,cad4,cad5,cad6],
        season: "Session",
        eventDate: "13-12-2023",
        eventLocation: "AAST Engineering Building B",
        year: 2024
    },
    {
        eventName: "Hosting _VOIS",
        eventDesc: "Hosted across two days, this event gave participants an exclusive look into VOIS’s global operations, workplace culture, and career opportunities. Attendees gained valuable insights and inspiration from a company that’s shaping the future of technology and business—well beyond the ordinary.",
        images: [voiss1,voiss2,voiss3,voiss4,voiss5,voiss6],
        season: "Other",
        eventDate: "7-12-2023",
        eventLocation: "AAST Engineering Building A",
        year: 2024
    },
    {
        eventName: "REEPE 7th",
        eventDesc: "The REEPE Conference is a prestigious event that brings together engineers, designers, industry professionals, and university researchers to discuss power and energy systems, address environmental challenges, and engage in networking and knowledge sharing.",
        images: [repe1, repe2, repe3, repe4, repe5, repe6, repe7, repe8],
        season: "Event",
        eventDate: "11-03-2025",
        eventLocation: "AAST Engineering Building A",
        year: 2024
    },
    {
        eventName: "Ramadan Iftar",
        eventDesc: "In Ramadan, we came together for a warm iftar. From sharing a delicious meal to enjoying friendly games and hanging out afterwards, it was a memorable evening full of connection, laughter, and good vibes.",
        images: [ramadan2],
        season: "Other",
        eventDate: "16-03-2024",
        eventLocation: "Engineers Club, New Cairo",
        year: 2024
    },
    {
        eventName: "Opening",
        eventDesc: "We proudly introduced our new board members, the passionate team leading us into this next chapter. We also took a moment to reflect on our past achievements, highlighting the milestones, successful events, and community impact we've made together.",
        images: [openingg1, openingg2, openingg3],
        season: "Other",
        eventDate: "29-10-2023",
        eventLocation: "AAST Engineering Building A",
        year: 2024
    },
    {
        eventName: "Enginereeing Gateway Vol. 2",
        eventDesc: "Designed specifically for students in grades 10 to 12, the program featured hands-on workshops in circuits, Arduino, Python, and mechanical design—all paired with fun, engaging activities to introduce high schoolers to the exciting world of engineering.",
        images: [egg1, egg2, egg3, egg4, egg5, egg6, egg7, egg8, egg9, egg10, egg11, egg12],
        season: "Event",
        eventDate: "26-04-2024",
        eventLocation: "AAST Engineering Building A",
        year: 2024
    }
];

const years = [
    { label: '2022-2023', value: 2023 },
    { label: '2023-2024', value: 2024 },
    { label: '2024-2025', value: 2025 },
    { label: '2025-2026', value: 2026 },
];
const eventTypes = ["All", "Event", "Session", "Other"];

const Events = () => {
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedType, setSelectedType] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showBackToTop, setShowBackToTop] = useState(false);
    const container = useRef(null);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const {scrollYProgress} = useScroll({
        target:container,
        offset:['start start' , 'end end']
    });
    
    const filteredEvents = eventsData.filter(event => {
        const yearMatch = event.year === selectedYear;
        const typeMatch = selectedType === "All" || event.season === selectedType;
        const searchMatch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase());
        return yearMatch && typeMatch && searchMatch;
    });

    const hasAnyForSelectedYear = eventsData.some(event => event.year === selectedYear);

    return (
        <div>
            <HeroWithSlope pName="Our Events" canvasId="events-gradient-canvas"></HeroWithSlope>
            
            {/* Original Events Section */}
            <h1 className='events-header'>Take a look at our latest events</h1>
            <div className="responsive">
            {/* Year Filter */}
            <div className="events-year-filter">
                {years.map(year => (
                    <button
                        key={year.value}
                        className={`events-year-btn${selectedYear === year.value ? ' active' : ''}`}
                        onClick={() => setSelectedYear(year.value)}
                        aria-pressed={selectedYear === year.value}
                    >
                        {year.label}
                    </button>
                ))}
            </div>
            
            {/* Event Type Filter */}
            <div className="events-type-filter">
                {eventTypes.map(type => (
                    <button
                        key={type}
                        className={`events-type-btn${selectedType === type ? ' active' : ''}`}
                        onClick={() => setSelectedType(type)}
                        aria-pressed={selectedType === type}
                    >
                        {type}
                    </button>
                ))}
            </div>

            
            {/* Search Bar */}
            <div className="events-search-container">
                <input
                    type="text"
                    placeholder="Search events by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="events-search-input"
                    aria-label="Search events by name"
                />
            </div>
            </div>
            
            <motion.div ref={container} className='events-cards-container'>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, i) => {
                        const totalCards = filteredEvents.length;
                        const startRange = i / totalCards;
                        const endRange = (i + 1) / totalCards;
                        
                        // Smoother scale progression with minimal difference
                        const baseScale = 0.88;
                        const scaleStep = (1.0 - baseScale) / (totalCards - 1);
                        const targetScale = baseScale + (i * scaleStep);
                        
                        return (
                            <EventsCard
                                key={event.eventName + event.eventDate}
                                i={i}
                                progress={scrollYProgress}
                                range={[startRange, endRange]}
                                targetScale={targetScale}
                                {...event}
                            />
                        );
                    })
                ) : (
                    <div className="no-events-msg" role="status" aria-live="polite">
                        {hasAnyForSelectedYear ? 'No events found for the selected filters.' : 'No events found for this year.'}
                    </div>
                )}
            </motion.div>
            
            {/* Thank You Message */}
            <div className="events-thank-you">
                <h2>Thank You AAST</h2>
                <p>We are grateful for the continuous support from the <a href="https://aast.edu/en/" target="_blank" rel="noopener noreferrer">Arab Academy for Science, Technology and Maritime Transport</a> in making our events and initiatives possible.</p>
            </div>
            
            {/* Spacing after events */}
            <div style={{ height: '10vh', background: 'transparent' }}></div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    className="events-back-to-top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Back to top"
                >
                    ↑
                </button>
            )}
        </div>
    )
}

export default Events
