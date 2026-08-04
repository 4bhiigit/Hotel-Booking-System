import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, Users, ShieldCheck, Award, Wifi, Utensils, Sparkles, 
  ArrowRight, Star, Volume2, VolumeX, Play, Pause, Compass, CheckCircle2, 
  ChevronDown, ChevronUp, Copy, Check, Clock, Heart, Coffee, Car, Sunset, 
  Waves, Shield, PhoneCall, HelpCircle, Gift, Zap, Eye, Calculator, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

// Background video options
const VIDEO_SOURCES = [
  {
    url: "/videos/hero_bg.mp4",
    title: "Custom Hotel Video"
  }
];

// Interactive 360 Virtual Suite Showcase Data
const VIRTUAL_SUITES = [
  {
    id: 'presidential',
    name: 'Maharajah Royal Palace Suite',
    size: '220 m²',
    capacity: '6 Guests',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    hotspots: [
      'Private Heated Infinity Pool & Lake View',
      'Panoramic 270° Lake Pichola Sunset Views',
      '24/7 Personal Royal Khadidmatgar (Butler)',
      'Italian Marble & Gold-Fitted Spa Bath'
    ],
    tag: 'Royal Heritage'
  },
  {
    id: 'executive',
    name: 'Rajputana Heritage Suite',
    size: '140 m²',
    capacity: '4 Guests',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    hotspots: [
      'Private Jharokha Terrace Lounge',
      'Royal Hand-Carved Teakwood Decor',
      'Bespoke King Featherbed with Silk Linen',
      'Freestanding Marble Soaking Tub'
    ],
    tag: 'Popular Choice'
  },
  {
    id: 'deluxe',
    name: 'Goa Oceanfront Infinity Villa',
    size: '95 m²',
    capacity: '2 Guests',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    hotspots: [
      'Private Sunset Balcony overlooking Arabian Sea',
      'Nespresso & Organic Indian Tea Bar',
      'Rainfall Walk-in Shower',
      'Smart In-Suite Automation'
    ],
    tag: 'Best Ocean View'
  },
  {
    id: 'spa-haven',
    name: 'Kerala Backwater Serene Haveli',
    size: '110 m²',
    capacity: '2 Guests',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    hotspots: [
      'In-suite Jacuzzi & Herbal Sauna',
      'Authentic Ayurvedic Aromatherapy Menu',
      'Organic Herbal Infusion Station',
      'Complimentary Daily Abhyanga Massage'
    ],
    tag: 'Wellness Specialty'
  }
];

// Experiences Data
const EXPERIENCES = [
  {
    id: 1,
    category: 'dining',
    title: 'Royal Indian Thali & Fine Dining',
    subtitle: 'Culinary Masterpieces & Vintage Spirits',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: 'Savor multi-course Royal Thali tasting menus prepared by Master Chefs using secret palace recipes.',
    icon: Utensils,
    badge: 'Award Winner'
  },
  {
    id: 2,
    category: 'wellness',
    title: 'Authentic Ayurvedic Spa & Yoga',
    subtitle: 'Rejuvenation for Mind, Body & Soul',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Experience traditional Panchakarma, Shirodhara oil therapy, and morning sunrise Yoga sessions.',
    icon: Waves,
    badge: 'Sanctuary'
  },
  {
    id: 3,
    category: 'activities',
    title: 'Private Sunset Shikara Boat Cruise',
    subtitle: 'Serene Lake Excursions & Champagne',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80',
    description: 'Glide across calm waters on private decorated Shikaras with live classical sitar melodies.',
    icon: Sunset,
    badge: 'Exclusive'
  },
  {
    id: 4,
    category: 'services',
    title: 'VIP Chauffeur & Royal Transfer',
    subtitle: 'Zero-Delay Airport & Railway Pickups',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description: 'Arrive in ultimate comfort with our luxury Rolls-Royce or Mercedes fleet and traditional flower garland welcome.',
    icon: Car,
    badge: '24/7 VIP'
  }
];

// FAQ Data
const FAQS = [
  {
    q: 'What are the standard check-in and check-out times?',
    a: 'Standard check-in starts at 2:00 PM and check-out is until 12:00 PM (Noon). VIP Members and Direct Website Bookings enjoy complimentary early check-in and late check-out options based on availability.'
  },
  {
    q: 'Are airport transfers and chauffeur services included?',
    a: 'We offer complimentary luxury airport transfer for all Executive and Presidential Palace Villa reservations. Private luxury car transfers can be arranged anytime with our 24/7 Royal Concierge.'
  },
  {
    q: 'What is your flexible cancellation policy?',
    a: 'Enjoy complete peace of mind with our 100% Flexible Cancellation policy. Cancel up to 48 hours prior to check-in with zero penalty fees and full instant refund.'
  },
  {
    q: 'Do you offer pure vegetarian, Jain, and customized dining options?',
    a: 'Yes! Our culinary team features dedicated kitchens for Pure Vegetarian, Jain, Halal, Gluten-Free, and custom dietary preferences with 24/7 in-suite gourmet dining.'
  },
  {
    q: 'Are children and families welcome at Grand Palace Hotel & Resort?',
    a: 'Yes, we welcome families with dedicated Kids Club activities, cultural folk performances, and babysitting services. We also feature family-friendly adjoining luxury suites.'
  }
];

// Testimonials Data
const TESTIMONIALS = [
  {
    name: 'Priya & Vikram Malhotra',
    role: 'Honeymoon Couple, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'Waking up to Lake Pichola view from the Maharajah Suite was pure magic. The Royal Thali dinner and personal butler service exceeded all expectations!',
    stay: 'Stayed 5 Nights in Maharajah Palace Suite'
  },
  {
    name: 'Rajesh Singhania',
    role: 'Managing Director, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'World-class Indian hospitality! The instant reservation invoice with QR check-in made our corporate retreat seamless and luxurious.',
    stay: 'Stayed 3 Nights in Rajputana Suite'
  },
  {
    name: 'Ananya Roy',
    role: 'Luxury Travel Journalist, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'From authentic Shirodhara Ayurvedic massages to sunset Shikara cruises, every detail radiates authentic Indian royal heritage.',
    stay: 'Stayed 4 Nights in Kerala Haveli'
  }
];

const HomePage = ({ showToast }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Background Video State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);

  // Hero Quick Search State
  const [searchType, setSearchType] = useState('All');
  const [searchCapacity, setSearchCapacity] = useState('1');
  const [searchCheckIn, setSearchCheckIn] = useState('');
  const [searchCheckOut, setSearchCheckOut] = useState('');

  // Interactive Live Price Estimator State
  const [calcNights, setCalcNights] = useState(3);
  const [calcGuests, setCalcGuests] = useState(2);
  const [calcTier, setCalcTier] = useState('executive');
  const [addBreakfast, setAddBreakfast] = useState(true);
  const [addSpa, setAddSpa] = useState(true);

  // Interactive Showcase Tab State
  const [activeSuiteIndex, setActiveSuiteIndex] = useState(0);

  // Experiences Filter State
  const [experienceCategory, setExperienceCategory] = useState('all');

  // Testimonials Slider State
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Promo Code Copied State
  const [copiedCode, setCopiedCode] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/rooms?limit=3&sort_by=rating_desc');
        setFeaturedRooms(res.data.rooms || []);
      } catch (err) {
        console.error("Failed to load featured rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Autoplay prevented:", err));
    }
  }, [videoIndex]);

  // Video playback controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Play error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const switchVideo = () => {
    const nextIdx = (videoIndex + 1) % VIDEO_SOURCES.length;
    setVideoIndex(nextIdx);
    if (videoRef.current) {
      videoRef.current.src = VIDEO_SOURCES[nextIdx].url;
      videoRef.current.play().catch(err => console.log("Play error:", err));
      setIsPlaying(true);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?type=${searchType}&capacity=${searchCapacity}`);
  };

  // Price Calculation Logic
  const tierPrices = {
    presidential: 85000,
    executive: 45000,
    deluxe: 28000,
    spa: 18500
  };
  const baseRate = tierPrices[calcTier] || 35000;
  const breakfastCost = addBreakfast ? 2500 * calcGuests * calcNights : 0;
  const spaCost = addSpa ? 7500 * calcNights : 0;
  const subtotal = baseRate * calcNights + breakfastCost + spaCost;
  const discount = calcNights >= 5 ? Math.round(subtotal * 0.15) : 0;
  const estimatedTotal = subtotal - discount;

  // Copy Promo Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText('GRAND25');
    setCopiedCode(true);
    if (showToast) showToast('Promo code GRAND25 copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Newsletter Submission
  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    if (showToast) showToast('VIP Membership activated! Check your inbox for your 10% discount voucher.', 'success');
  };

  const filteredExperiences = experienceCategory === 'all'
    ? EXPERIENCES
    : EXPERIENCES.filter(exp => exp.category === experienceCategory);

  const activeSuite = VIRTUAL_SUITES[activeSuiteIndex];

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      
      {/* HERO SECTION WITH ANIMATED HIGH-QUALITY HOTEL VIDEO BACKGROUND */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden px-4 sm:px-6">
        
        {/* Background Video Element */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-85 scale-105 transition-opacity duration-700"
            src={VIDEO_SOURCES[videoIndex].url}
          >
            <source src={VIDEO_SOURCES[videoIndex].url} type="video/mp4" />
          </video>
          {/* Subtle cinematic gradient overlay for high contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 pointer-events-none" />
        </div>

        {/* Video Control Buttons Floating Badge */}
        <div className="absolute top-8 right-6 z-20 flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause Background Video" : "Play Background Video"}
            className="p-2 rounded-xl bg-white/10 hover:bg-amber-500 text-white transition-all hover:scale-105"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute Video Audio" : "Mute Video Audio"}
            className="p-2 rounded-xl bg-white/10 hover:bg-amber-500 text-white transition-all hover:scale-105"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 pt-12">
          
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/40 backdrop-blur-xl text-amber-300 text-xs sm:text-sm font-extrabold uppercase tracking-widest animate-pulse-subtle shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>World-Class 5-Star Luxury Resort & Suites</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Indulge in Handcrafted Elegance at <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              Grand Hotel & Resort
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Experience oceanfront infinity villas, Michelin-starred culinary journeys, holistic thermal spas, and personalized 24/7 butler service tailored to your perfect sanctuary.
          </p>

          {/* Quick Search Card Overlay */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-5xl mx-auto bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl text-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400/90 mb-2 text-left">
                Suite Category
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="All">All Luxury Categories</option>
                <option value="Presidential">Presidential Villa</option>
                <option value="Suite">Executive Suite</option>
                <option value="Deluxe">Ocean Deluxe</option>
                <option value="Double">Double Suite</option>
                <option value="Single">Classic Single</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400/90 mb-2 text-left">
                Guests
              </label>
              <select
                value={searchCapacity}
                onChange={(e) => setSearchCapacity(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="1">1 Solo Traveler</option>
                <option value="2">2 Guests (Couple)</option>
                <option value="4">4 Guests (Family)</option>
                <option value="6">6+ VIP Guests</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400/90 mb-2 text-left">
                Check-In Date
              </label>
              <input
                type="date"
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Check Availability
            </button>
          </form>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <span className="text-2xl font-black text-amber-400">4.9 / 5.0</span>
              <p className="text-xs text-slate-300 mt-0.5">Over 3,500+ Reviews</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <span className="text-2xl font-black text-amber-400">100%</span>
              <p className="text-xs text-slate-300 mt-0.5">Verified Reservations</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <span className="text-2xl font-black text-amber-400">24 / 7</span>
              <p className="text-xs text-slate-300 mt-0.5">Personal Butler Service</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <span className="text-2xl font-black text-amber-400">15+</span>
              <p className="text-xs text-slate-300 mt-0.5">Global Hotel Awards</p>
            </div>
          </div>

        </div>
      </section>

      {/* PROMOTIONAL COUNTDOWN & EXCLUSIVE DISCOUNT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 border border-amber-500/40 p-8 sm:p-12 text-white shadow-2xl">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
                <Gift className="w-3.5 h-3.5" />
                Limited-Time Luxury Offer
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Summer Luxury Escape — Save Up to 25% OFF
              </h2>
              <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
                Book a stay of 3+ nights directly on our website and receive complimentary daily gourmet breakfast, ₹7,500 spa voucher, and late check-out.
              </p>
            </div>

            {/* Promo Code & Action Box */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl backdrop-blur-xl">
              <div className="text-center sm:text-left px-2">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Use Promo Code</span>
                <div className="text-2xl font-black text-amber-400 tracking-wider">GRAND25</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "Code Copied!" : "Copy Promo Code"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED LUXURY SUITES (LOADED FROM FASTAPI API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Handpicked Accommodations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              Top Rated Luxury Suites
            </h2>
          </div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors group"
          >
            Explore All Rooms & Suites <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBookNow={(r) => {
                  if (!user) {
                    showToast("Please sign in to make a reservation.", "info");
                    navigate("/login");
                  } else {
                    setSelectedRoom(r);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* INTERACTIVE LIVE STAY PRICE & COST ESTIMATOR CALCULATOR WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-2xl space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-widest border border-amber-500/20">
              <Calculator className="w-3.5 h-3.5" />
              Interactive Estimator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Instant Stay Cost & Perks Calculator
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Customize your stay parameters below to view real-time pricing breakdowns, complimentary perks, and potential seasonal discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Select Suite Tier */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Select Suite Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'deluxe', label: 'Ocean Deluxe', price: '₹28,000/nt' },
                    { id: 'executive', label: 'Executive Suite', price: '₹45,000/nt' },
                    { id: 'spa', label: 'Spa Sanctuary', price: '₹18,500/nt' },
                    { id: 'presidential', label: 'Presidential', price: '₹85,000/nt' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCalcTier(t.id)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        calcTier === t.id
                          ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow-lg scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 font-semibold'
                      }`}
                    >
                      <div className="text-xs uppercase font-extrabold">{t.label}</div>
                      <div className="text-sm font-black mt-1">{t.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Nights */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Duration of Stay</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">{calcNights} {calcNights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={calcNights}
                  onChange={(e) => setCalcNights(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>1 Night</span>
                  <span>7 Nights</span>
                  <span>14 Nights (15% OFF applied for 5+ nights)</span>
                </div>
              </div>

              {/* Slider 2: Guests */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Number of Guests</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">{calcGuests} {calcGuests === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={calcGuests}
                  onChange={(e) => setCalcGuests(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Add-on Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-500/50 transition-all">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-5 h-5 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold block">Gourmet Breakfast</span>
                      <span className="text-xs text-slate-400">₹2,500/guest/night</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addBreakfast}
                    onChange={(e) => setAddBreakfast(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-500/50 transition-all">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold block">Daily Spa Access</span>
                      <span className="text-xs text-slate-400">₹7,500/night</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addSpa}
                    onChange={(e) => setAddSpa(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

            </div>

            {/* Right Summary Calculation Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Estimated Cost Breakdown</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                  {calcNights} Nights / {calcGuests} Guests
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Base Rate ({calcNights} x ₹{baseRate.toLocaleString('en-IN')})</span>
                  <span className="font-bold text-white">₹{(baseRate * calcNights).toLocaleString('en-IN')}</span>
                </div>

                {addBreakfast && (
                  <div className="flex justify-between text-slate-300">
                    <span>Gourmet Buffet Breakfast</span>
                    <span className="font-bold text-white">₹{breakfastCost.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {addSpa && (
                  <div className="flex justify-between text-slate-300">
                    <span>Daily Spa Access & Hydrotherapy</span>
                    <span className="font-bold text-white">₹{spaCost.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Extended Stay Discount (15%)</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-slate-400 block">Total Price</span>
                  <span className="text-3xl font-black text-amber-400">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 ml-1">incl. taxes & fees</span>
                </div>

                <button
                  onClick={() => navigate('/rooms')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Reserve This Suite</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero reservation fee • Free cancellation up to 48 hours</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* INTERACTIVE 360° VIRTUAL SUITE SHOWCASE & EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            360° Virtual Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Explore Luxury Suites & Villas
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Select a suite tier below to inspect key architectural hotspots, private plunge pool features, and luxury specifications.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {VIRTUAL_SUITES.map((suite, idx) => (
            <button
              key={suite.id}
              onClick={() => setActiveSuiteIndex(idx)}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                activeSuiteIndex === idx
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
              }`}
            >
              {suite.name}
            </button>
          ))}
        </div>

        {/* Dynamic Interactive Suite Viewer Card */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          
          {/* Image Showcase Container */}
          <div className="lg:col-span-7 relative group overflow-hidden">
            <img
              src={activeSuite.image}
              alt={activeSuite.name}
              className="w-full h-full object-cover min-h-[350px] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Floating 360 Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2 shadow-xl">
              <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>360° Interactive Tour Ready</span>
            </div>

            {/* Tag Badge */}
            <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg">
              {activeSuite.tag}
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{activeSuite.name}</h3>
              <p className="text-amber-300 text-sm font-bold">{activeSuite.size} • {activeSuite.capacity}</p>
            </div>
          </div>

          {/* Details & Hotspots Column */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6 bg-slate-900/90 backdrop-blur-xl">
            
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Suite Highlights</span>
                <span className="text-2xl font-black text-amber-400">${activeSuite.price} <span className="text-xs text-slate-400 font-normal">/ night</span></span>
              </div>

              {/* Hotspots List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Key Amenities</span>
                {activeSuite.hotspots.map((spot, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/40 transition-all">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">{spot}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => navigate('/rooms')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <span>Book {activeSuite.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* CURATED RESORT EXPERIENCES & AMENITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Unmatched Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              Curated Guest Experiences
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Experiences' },
              { id: 'dining', label: 'Fine Dining' },
              { id: 'wellness', label: 'Spa & Wellness' },
              { id: 'activities', label: 'Yacht Cruises' },
              { id: 'services', label: 'VIP Services' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setExperienceCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  experienceCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredExperiences.map((exp) => {
            const IconComp = exp.icon;
            return (
              <div
                key={exp.id}
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md text-amber-400 border border-white/10">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
                      {exp.badge}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                      {exp.subtitle}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                      if (showToast) showToast(`Experience "${exp.title}" reserved! Our concierge will contact you.`, 'success');
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Reserve Experience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* VERIFIED GUEST REVIEWS & TESTIMONIALS SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-amber-500/30 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Verified Guest Stories
            </div>

            {/* Testimonial Quote */}
            <div className="space-y-6 min-h-[160px] flex flex-col justify-center items-center">
              <div className="flex justify-center gap-1">
                {[...Array(TESTIMONIALS[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="text-xl sm:text-2xl font-serif italic text-slate-200 leading-relaxed max-w-3xl">
                "{TESTIMONIALS[testimonialIndex].quote}"
              </blockquote>

              <div className="flex items-center justify-center gap-4 pt-2">
                <img
                  src={TESTIMONIALS[testimonialIndex].avatar}
                  alt={TESTIMONIALS[testimonialIndex].name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
                />
                <div className="text-left">
                  <h4 className="text-base font-extrabold text-white">{TESTIMONIALS[testimonialIndex].name}</h4>
                  <p className="text-xs text-amber-300 font-semibold">{TESTIMONIALS[testimonialIndex].role}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{TESTIMONIALS[testimonialIndex].stay}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setTestimonialIndex((testimonialIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="p-3 rounded-full bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      testimonialIndex === i ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTestimonialIndex((testimonialIndex + 1) % TESTIMONIALS.length)}
                className="p-3 rounded-full bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (INTERACTIVE ACCORDION) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Everything you need to know about stay policies, VIP check-in, and luxury amenities.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left font-extrabold text-base sm:text-lg flex items-center justify-between gap-4 text-slate-900 dark:text-white hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* INTERACTIVE VIP CLUB & NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-14 overflow-hidden border border-amber-500/30 shadow-2xl text-center space-y-6">
          
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Gift className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Join the Grand Hotel VIP Club
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Subscribe today to unlock secret luxury rates, private spa access vouchers, and seasonal invitation-only events.
            </p>

            {newsletterSubscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 animate-bounce-short">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>VIP Subscription Active! Check your email for your 10% Welcome Voucher.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your personal email address..."
                  className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                >
                  Join VIP Club
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* BOOKING MODAL */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={(msg) => showToast(msg, "success")}
          onError={(err) => showToast(err, "error")}
        />
      )}

    </div>
  );
};

export default HomePage;
