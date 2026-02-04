import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './BirthdayToday.css';

const BirthdayToday = () => {
  const [todaysBirthdays, setTodaysBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Book state
  const [bookState, setBookState] = useState('closed');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Drag state untuk page turn interaktif
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0 = flat, 1 = fully flipped
  const [dragDirection, setDragDirection] = useState(null); // 'next' or 'prev'

  const containerRef = useRef(null);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  // Constants
  const DRAG_THRESHOLD = 0.35; // 35% drag = commit to flip
  const BOOK_WIDTH = 280; // Width of book for calculating drag percentage

  // === HELPERS ===
  const getIndonesianDate = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isBirthdayToday = (dateString) => {
    if (!dateString) return false;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const parts = dateString.split(' ');
    if (parts.length < 2) return false;
    const day = parseInt(parts[0]);
    const monthStr = parts[1];
    const monthIndex = months.indexOf(monthStr);
    const today = new Date();
    return today.getDate() === day && today.getMonth() === monthIndex;
  };

  const fireConfetti = () => {
    confetti.reset();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#F85C70', '#6393c9', '#ffffff', '#FFD700'],
      zIndex: 9999,
      disableForReducedMotion: true
    });
  };

  // === FETCH DATA ===
  useEffect(() => {
    let timer;
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const fullUrl = `${baseUrl}/api/public/ultah`;
        const response = await fetch(fullUrl);
        const data = await response.json();

        const filtered = Array.isArray(data)
          ? data.filter(student => isBirthdayToday(student.tanggal_lahir))
          : [];

        setTodaysBirthdays(filtered);
        setLoading(false);

        timer = setTimeout(() => {
          setBookState('opening');
        }, 5000);

      } catch (error) {
        console.error("Gagal load data:", error);
        setLoading(false);
        setBookState('opening');
      }
    };
    fetchData();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (bookState === 'opening') {
      const timer = setTimeout(() => {
        setBookState('open');
        if (todaysBirthdays.length > 0) fireConfetti();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [bookState, todaysBirthdays.length]);

  // === MENU ACTIONS ===
  const handleShare = async () => {
    const student = todaysBirthdays[currentIndex];
    setIsMenuOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HBD ${student.nama}!`,
          text: `Happy Birthday ${student.nama}! 🎉`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link disalin!");
    }
  };

  const handleDownload = () => {
    const student = todaysBirthdays[currentIndex];
    setIsMenuOpen(false);
    const imgUrl = student.foto?.startsWith('data:image')
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

  // === DRAG-BASED PAGE TURN ===
  const getClientX = (e) => {
    return e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleDragStart = useCallback((e) => {
    if (bookState !== 'open' || todaysBirthdays.length <= 1) return;

    const clientX = getClientX(e);
    dragStartX.current = clientX;
    dragCurrentX.current = clientX;
    setIsDragging(true);
    setIsMenuOpen(false);

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [bookState, todaysBirthdays.length]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;

    const clientX = getClientX(e);
    dragCurrentX.current = clientX;

    const deltaX = dragStartX.current - clientX;
    const progress = Math.min(Math.max(deltaX / BOOK_WIDTH, -1), 1);

    // Determine direction based on drag
    if (progress > 0.05 && currentIndex < todaysBirthdays.length - 1) {
      setDragDirection('next');
      setDragProgress(Math.min(progress, 1));
    } else if (progress < -0.05 && currentIndex > 0) {
      setDragDirection('prev');
      setDragProgress(Math.min(Math.abs(progress), 1));
    } else {
      setDragDirection(null);
      setDragProgress(0);
    }
  }, [isDragging, currentIndex, todaysBirthdays.length]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const shouldFlip = dragProgress >= DRAG_THRESHOLD;

    if (shouldFlip && dragDirection) {
      // Animate to complete flip
      animateFlip(dragProgress, 1, () => {
        if (dragDirection === 'next' && currentIndex < todaysBirthdays.length - 1) {
          setCurrentIndex(prev => prev + 1);
          fireConfetti();
        } else if (dragDirection === 'prev' && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          fireConfetti();
        }
        setDragProgress(0);
        setDragDirection(null);
      });
    } else {
      // Animate back to start
      animateFlip(dragProgress, 0, () => {
        setDragProgress(0);
        setDragDirection(null);
      });
    }
  }, [isDragging, dragProgress, dragDirection, currentIndex, todaysBirthdays.length]);

  // Smooth animation helper
  const animateFlip = (from, to, onComplete) => {
    const duration = 300;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDragProgress(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Button-based navigation (fallback)
  const goToNext = () => {
    if (isDragging || currentIndex >= todaysBirthdays.length - 1) return;
    setDragDirection('next');
    animateFlip(0, 1, () => {
      setCurrentIndex(prev => prev + 1);
      setDragProgress(0);
      setDragDirection(null);
      fireConfetti();
    });
  };

  const goToPrev = () => {
    if (isDragging || currentIndex <= 0) return;
    setDragDirection('prev');
    animateFlip(0, 1, () => {
      setCurrentIndex(prev => prev - 1);
      setDragProgress(0);
      setDragDirection(null);
      fireConfetti();
    });
  };

  // Touch/Mouse event handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchMove = (e) => {
      if (isDragging) e.preventDefault();
      handleDragMove(e);
    };

    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('mousemove', handleDragMove);

    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('mouseleave', handleDragEnd);

    return () => {
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('mouseleave', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // === RENDER HELPERS ===
  const getProfileSrc = (student) => {
    if (!student?.foto) return null;
    return student.foto.startsWith('data:image') ? student.foto : `data:image/jpeg;base64,${student.foto}`;
  };

  const student = todaysBirthdays[currentIndex];
  const prevStudent = currentIndex > 0 ? todaysBirthdays[currentIndex - 1] : null;
  const nextStudent = currentIndex < todaysBirthdays.length - 1 ? todaysBirthdays[currentIndex + 1] : null;

  // Calculate page rotation based on drag direction
  // For 'next': current page flips AWAY (rotates from 0 to -180)
  // For 'prev': previous page flips IN (rotates from -180 to 0)
  const getCurrentPageStyle = () => {
    if (dragDirection === 'next' && dragProgress > 0) {
      // Current page flips away to the left
      const rotation = dragProgress * 160;
      return {
        transform: `rotateY(-${rotation}deg)`,
        boxShadow: `inset ${-20 * dragProgress}px 0 ${40 * dragProgress}px -20px rgba(0, 0, 0, ${0.3 + dragProgress * 0.4})`,
      };
    }
    return {};
  };

  const getPrevPageStyle = () => {
    if (dragDirection === 'prev' && dragProgress > 0) {
      // Previous page flips in from the left
      const rotation = 160 - (dragProgress * 160);
      return {
        transform: `rotateY(-${rotation}deg)`,
        boxShadow: `inset ${-20 * (1 - dragProgress)}px 0 ${40 * (1 - dragProgress)}px -20px rgba(0, 0, 0, ${0.3 + (1 - dragProgress) * 0.4})`,
        zIndex: 40,
      };
    }
    return { transform: 'rotateY(-160deg)', zIndex: 10 };
  };

  const renderPage = (pageStudent, pageIndex) => {
    if (!pageStudent) return null;
    const pageSrc = getProfileSrc(pageStudent);

    return (
      <div className="book-page-content">
        <div className="page-spine-shadow"></div>
        <div className="page-fold-shadow"></div>

        <div className="page-inner">
          <div className="page-header">
            <span className="page-badge">Birthday Page</span>
            <h2 className="page-chapter">Birthday Chapter {pageIndex + 1}</h2>
            <h4 className="page-chapter-2">Happy Birthday 🎉</h4>
          </div>

          <div className="profile-container">
            <div className="profile-glow"></div>
            <div className="profile-frame">
              {pageSrc ? (
                <img src={pageSrc} alt={pageStudent.nama} className="profile-image" />
              ) : (
                <div className="profile-placeholder">No Photo</div>
              )}
            </div>
            <div className="age-badge">{pageStudent.usia}</div>
          </div>

          <div className="info-section">
            <h1 className="student-name">{pageStudent.nama}</h1>
            <div className="name-divider"></div>
            <p className="student-prodi">{pageStudent.prodi}</p>
          </div>

          <div className="quote-section">
            <span className="quote-mark open">"</span>
            <p className="quote-text">
              "Selamat ulang tahun! Semoga lembaran baru usiamu diisi dengan cerita bahagia, kesehatan, dan kesuksesan."
            </p>
            <span className="quote-mark close">"</span>
          </div>

          {todaysBirthdays.length > 1 && (
            <div className="page-indicator">
              — {pageIndex + 1} / {todaysBirthdays.length} —
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="birthday-container">
      {/* Back Button */}
      <button onClick={() => navigate('/')} className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      {/* Menu */}
      {todaysBirthdays.length > 0 && bookState === 'open' && (
        <div className="menu-container">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              <button onClick={handleShare} className="menu-item">
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Link
              </button>
              <button onClick={handleDownload} className="menu-item">
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Simpan Foto
              </button>
            </div>
          )}
        </div>
      )}

      {/* Book Scene */}
      <div className="book-scene">
        <div className={`book ${bookState}`}>

          {/* Book Cover */}
          <div className={`book-cover ${bookState === 'opening' || bookState === 'open' ? 'is-open' : ''}`}>
            <div className="cover-texture"></div>
            <div className="cover-border"></div>
            <div className="cover-content">
              <div className="cover-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="cover-title">Daftar Orang<br />Yang Ulang Tahun</h1>
              <div className="cover-divider"></div>
              <p className="cover-date">{getIndonesianDate()}</p>
            </div>
            {loading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}
            <div className="cover-spine"></div>
          </div>

          {/* Page Stack */}
          <div className="page-stack">
            <div className="stack-page stack-1"></div>
            <div className="stack-page stack-2"></div>
            <div className="stack-page stack-3"></div>
          </div>

          {/* Pages Container - Interactive Area */}
          <div
            ref={containerRef}
            className={`pages-container ${isDragging ? 'is-dragging' : ''}`}
            onTouchStart={handleDragStart}
            onMouseDown={handleDragStart}
          >
            {/* Underlying Next Page - visible when flipping to next */}
            {todaysBirthdays.length > 0 && nextStudent && dragDirection === 'next' && (
              <div className="book-page underlying-page">
                {renderPage(nextStudent, currentIndex + 1)}
              </div>
            )}

            {/* Previous Page - animates IN when going back */}
            {todaysBirthdays.length > 0 && prevStudent && dragDirection === 'prev' && (
              <div
                className="book-page flipping-prev-page"
                style={getPrevPageStyle()}
              >
                {renderPage(prevStudent, currentIndex - 1)}
                {/* Page curl for prev page */}
                <div
                  className="page-curl-overlay"
                  style={{ opacity: (1 - dragProgress) * 0.7 }}
                ></div>
              </div>
            )}

            {/* Current Page */}
            <div
              className={`book-page current-page ${dragDirection === 'next' ? 'is-flipping' : ''}`}
              style={getCurrentPageStyle()}
            >
              {todaysBirthdays.length > 0 ? (
                renderPage(student, currentIndex)
              ) : (
                <div className="book-page-content empty-page">
                  <div className="page-spine-shadow"></div>
                  <div className="page-inner">
                    <h3 className="empty-title">Halaman Kosong</h3>
                    <p className="empty-text">Tidak ada yang merayakan ulang tahun hari ini.</p>
                    <button onClick={() => navigate('/')} className="close-book-btn">Tutup Buku</button>
                  </div>
                </div>
              )}

              {/* Page curl effect overlay - only for next direction */}
              {dragDirection === 'next' && dragProgress > 0 && (
                <div
                  className="page-curl-overlay"
                  style={{ opacity: dragProgress * 0.7 }}
                ></div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {bookState === 'open' && todaysBirthdays.length > 1 && !isDragging && (
            <>
              {currentIndex > 0 && (
                <button onClick={goToPrev} className="nav-arrow nav-prev">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}
              {currentIndex < todaysBirthdays.length - 1 && (
                <button onClick={goToNext} className="nav-arrow nav-next">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Swipe Hint */}
      {bookState === 'open' && todaysBirthdays.length > 1 && !isDragging && (
        <div className="swipe-hint">
          ← Geser halaman untuk berpindah →
        </div>
      )}
    </div>
  );
};

export default BirthdayToday;