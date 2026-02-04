import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Import Component Halaman
import BirthdayToday from './BirthdayToday.jsx';

// === COMPONENT HOME (Landing Page Asli Kamu) ===
function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate(); // Hook untuk pindah halaman

  // Logic detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      behavior: 'smooth',
    });
  };

  return (
    // WRAPPER UTAMA
    <div className="relative w-full min-h-screen font-sans text-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* --- DYNAMIC HEADER WRAPPER --- */}
      <header
        className={`fixed top-0 left-0 w-full z-50 flex flex-col justify-center transition-all duration-1000 ease-in-out
          ${isScrolled 
            ? 'h-20 p-0'          
            : 'h-screen p-6 md:p-12' 
          } 
        `}
      >
       <div 
          className={`relative w-full h-full overflow-hidden transition-all duration-1000 ease-in-out shadow-2xl
            ${isScrolled ? 'rounded-none' : 'rounded-[3rem]'} 
          `}
        >
          {/* BACKGROUND IMAGE */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[1500ms] ease-in-out
              ${isScrolled ? 'scale-100' : 'scale-110'} 
            `}
            style={{
              backgroundImage: "url('/imgs/header.jpg')",
            }}
          >
            <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isScrolled ? 'bg-opacity-80' : 'bg-opacity-30'}`}></div>
          </div>

          {/* --- CONTENT HEADER --- */}
          <div className="relative z-10 w-full h-full container mx-auto px-6 flex flex-col justify-center">
            
            {/* NAVBAR */}
            <div className={`absolute top-0 left-0 w-full px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-700 delay-300
               ${isScrolled 
                 ? 'opacity-100 translate-y-2' 
                 : 'opacity-0 -translate-y-10 pointer-events-none'
               }
            `}>
              <img src="/imgs/logo-header.png" alt="Logo" className="h-6 md:h-7 w-auto object-contain" />
              
              <nav className="hidden md:flex space-x-8 text-white text-sm font-semibold tracking-wide">
                <a href="#" className="hover:text-[#6393C9] transition-colors">ABOUT</a>
                <a href="#" className="hover:text-[#6393C9] transition-colors">WORKS</a>
                {/* Contoh Link ke halaman Birthday */}
                <button onClick={() => navigate('/birthday-today')} className="hover:text-primary transition-colors uppercase">
                    Birthday Today
                </button>
              </nav>
            </div>

            {/* HERO TEXT */}
            <div className={`flex flex-col items-start justify-center text-left text-white transition-all duration-700
              ${isScrolled ? 'opacity-0 scale-90 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}
            `}>
              <h2 className="text-5xl md:text-8xl font-bold mb-6 drop-shadow-lg tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6393C9] to-blue-400">THE PUTRAS</span>
              </h2>
              <p className="text-xl md:text-2xl max-w-2xl font-light text-gray-200 drop-shadow-md">
                Portofolio dari Putra.
              </p>
            </div>

            {/* SCROLL BUTTON */}
            <div className={`absolute bottom-10 left-0 w-full flex justify-center transition-all duration-500
               ${isScrolled ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}
            `}>
               <button onClick={handleScrollDown} className="group flex flex-col items-center gap-3 cursor-pointer">
                  <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-white group-hover:text-[#6393C9] transition-colors animate-pulse">
                    Scroll Down
                  </span>
                  <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-[#6393C9] animate-bounce"></div>
                  </div>
                </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT (Potongan konten utama) */}
      <main className="relative z-0 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="h-screen"></div>
        <div className="container mx-auto px-6 py-24">
             <div className="max-w-6xl mx-auto flex flex-col gap-32">
                <section>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white">Fullstack & Coding</h3>
                    {/* ... (Konten lainnya sama seperti sebelumnya) ... */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded mt-4">
                        <p>Konten portfolio kamu di sini...</p>
                    </div>
                </section>
             </div>
        </div>
      </main>
    </div>
  );
}

// === COMPONENT UTAMA APP (ROUTER SETUP) ===
function App() {
  return (
    <Router>
      <Routes>
        {/* Route Utama (Landing Page) */}
        <Route path="/" element={<Home />} />
        
        {/* Route Baru: Birthday Today */}
        <Route path="/birthday-today" element={<BirthdayToday />} />
      </Routes>
    </Router>
  );
}

export default App;