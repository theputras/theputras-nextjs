import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti'; // Import library confetti

const BirthdayToday = () => {
  const [todaysBirthdays, setTodaysBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // State untuk Menu Dropdown (Pojok Kanan Atas)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State untuk Swipe Gesture
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const navigate = useNavigate();

  // === 1. HELPER: CONFETTI EFFECT ===
  const fireConfetti = () => {
    // Reset confetti biar gak numpuk parah
    confetti.reset();

    // Tembakkan confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }, // Muncul dari agak bawah tengah
      colors: ['#F85C70', '#6393c9', '#ffffff', '#FFD700'], // Sesuaikan warna tema (Pink, Biru, Putih, Emas)
      zIndex: 9999, // Pastikan di atas segalanya
      disableForReducedMotion: true // Accessibility
    });
  };

  // === 2. HELPER: PARSE TANGGAL ===
  const isBirthdayToday = (dateString) => {
    if (!dateString) return false;
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const parts = dateString.split(' '); 
    if (parts.length < 2) return false;
    const day = parseInt(parts[0]);
    const monthStr = parts[1];
    const monthIndex = months.indexOf(monthStr);
    const today = new Date();
    return today.getDate() === day && today.getMonth() === monthIndex;
  };

  // === 3. FETCH DATA & INIT ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL; 
        const fullUrl = `${baseUrl}/api/public/ultah`;
        
        // console.log("Fetching from:", fullUrl); // Debugging

        const response = await fetch(fullUrl);
        const data = await response.json();
        
        const filtered = Array.isArray(data) 
          ? data.filter(student => isBirthdayToday(student.tanggal_lahir))
          : [];

        setTodaysBirthdays(filtered);
        
        // Trigger Confetti pas load pertama kali jika ada yang ultah
        if (filtered.length > 0) {
          setTimeout(fireConfetti, 500);
        }

      } catch (error) {
        console.error("Gagal load data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // === 4. NAVIGASI (NEXT/PREV) ===
  const changeSlide = (direction) => {
    // Tutup menu kalau lagi buka
    setIsMenuOpen(false);

    if (direction === 'next' && currentIndex < todaysBirthdays.length - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipping(false);
        fireConfetti(); // Confetti lagi pas ganti orang!
      }, 400); 
    } else if (direction === 'prev' && currentIndex > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsFlipping(false);
        fireConfetti(); // Confetti lagi pas ganti orang!
      }, 400);
    }
  };

  // === 5. SWIPE LOGIC ===
  const onTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) changeSlide('next');
    else if (distance < -50) changeSlide('prev');
    touchStartX.current = 0; touchEndX.current = 0;
  };

  // === 6. ACTIONS (SHARE & SAVE) ===
  const handleShare = async () => {
    const student = todaysBirthdays[currentIndex];
    setIsMenuOpen(false); // Tutup menu setelah klik

    if (navigator.share) {
      try {
        await navigator.share({
          title: `HBD ${student.nama}!`,
          text: `Happy Birthday ${student.nama} (${student.prodi})! 🎉`,
          url: window.location.href,
        });
      } catch (err) { /* ignore cancel */ }
    } else {
      alert("Link disalin!");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = () => {
    const student = todaysBirthdays[currentIndex];
    setIsMenuOpen(false); // Tutup menu setelah klik

    const imgUrl = student.foto && student.foto.startsWith('data:image') 
      ? student.foto 
      : `data:image/jpeg;base64,${student.foto}`;

    if (!imgUrl) return;
    
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `HBD-${student.nama}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Image Src
  const getProfileSrc = (student) => {
    if (!student?.foto) return null;
    return student.foto.startsWith('data:image') ? student.foto : `data:image/jpeg;base64,${student.foto}`;
  };

  // --- RENDER ---

  if (loading) return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Loading...</div>;

  if (todaysBirthdays.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#111] font-sans">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-sm">
           <h2 className="text-xl font-bold text-white mb-2">Tidak Ada Ulang Tahun</h2>
           <p className="text-gray-400 mb-6 text-sm">Hari ini sepi, coba cek besok ya.</p>
           <button onClick={() => navigate('/')} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm border border-white/20 transition-all">
             Kembali ke Home
           </button>
        </div>
      </div>
    );
  }

  const student = todaysBirthdays[currentIndex];
  const profileSrc = getProfileSrc(student);

  return (
    // BACKGROUND UTAMA (Dark Solid - No Image)
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0F19] overflow-hidden font-sans text-gray-800">
      
      {/* Dekorasi Background Abstrak (Biar gak flat banget) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Tombol Back (Kiri Atas) */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 z-40 text-white/50 hover:text-white transition-colors p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      {/* Tombol Menu Pojok Kanan Atas (Strip Tiga Kecil) */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md border border-white/10"
        >
          {/* Icon Hamburger Kecil */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            <button 
              onClick={handleShare}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors border-b border-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button 
              onClick={handleDownload}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Save Foto
            </button>
          </div>
        )}
      </div>

      {/* === CARD UTAMA === */}
      <div 
        className={`
          relative z-10 
          w-full max-w-[360px] aspect-[9/16] max-h-[85vh]
          rounded-[2rem] border border-white/10
          bg-white/5 backdrop-blur-xl shadow-2xl
          flex flex-col overflow-hidden
          transition-all duration-500 transform
          ${isFlipping ? 'scale-90 opacity-0 rotate-y-6' : 'scale-100 opacity-100 rotate-y-0'}
        `}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        
        {/* Gloss Effect (Pantulan cahaya halus) */}
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rotate-12"></div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-20 text-white gap-6">
          
          {/* Header text */}
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-2">
              Today's Birthday
            </span>
            <h1 className="text-3xl font-bold">Happy Birthday</h1>
          </div>

          {/* Foto Profile */}
          <div className="relative group">
             {/* Ring Glow Animasi */}
             <div className="absolute -inset-2 bg-gradient-to-tr from-primary via-purple-500 to-blue opacity-50 blur-lg rounded-full animate-pulse group-hover:opacity-80 transition-opacity"></div>
             
             <div className="relative w-40 h-40 rounded-full p-1 bg-[#1a1a2e] border-2 border-white/20 shadow-2xl overflow-hidden">
                {profileSrc ? (
                  <img src={profileSrc} alt={student.nama} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs">No Photo</div>
                )}
             </div>

             {/* Badge Usia */}
             <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-white to-gray-200 text-gray-900 text-lg font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg border-2 border-[#1a1a2e]">
               {student.usia}
             </div>
          </div>

          {/* Nama & Info */}
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold mb-1 truncate px-2">{student.nama}</h2>
            <p className="text-sm text-gray-400 uppercase tracking-widest text-[10px] font-semibold border-b border-white/10 pb-2 inline-block">
              {student.prodi}
            </p>
          </div>

          {/* Wishes */}
          <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5">
             <p className="text-center text-xs italic text-gray-300 leading-relaxed font-light">
               "Selamat ulang tahun! Semoga panjang umur, sehat selalu, makin sukses kuliahnya, dan tercapai semua impiannya di tahun ini!"
             </p>
          </div>

        </div>

        {/* Pagination Dots (Jika > 1) */}
        {todaysBirthdays.length > 1 && (
          <div className="absolute bottom-6 w-full flex justify-center gap-2 z-30">
            {todaysBirthdays.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]' : 'w-1.5 bg-white/20'}`}
              ></div>
            ))}
          </div>
        )}

      </div>

      {/* Swipe Hint (Mobile Only) */}
      {todaysBirthdays.length > 1 && (
        <div className="absolute bottom-8 text-white/20 text-[10px] uppercase tracking-widest animate-pulse pointer-events-none">
          Swipe
        </div>
      )}

    </div>
  );
};

export default BirthdayToday;