import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Storefront, Truck, ShieldCheck, ArrowRight, List, X, 
  ShoppingCart, Carrot, Pizza, TShirt, DeviceMobile, 
  Sparkle, HouseLine, BookOpen, Sneaker, MapPin
} from '@phosphor-icons/react';
import logo from '../assets/logo.png';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Categories', id: 'categories' },
    { name: 'About', id: 'about' },
    { name: 'How It Works', id: 'how-it-works' },
  ];

  const categories = [
    { name: 'Groceries', desc: 'Fresh essentials for everyday life', icon: <Carrot size={32} /> },
    { name: 'Food & Restaurants', desc: 'Order your local favorites', icon: <Pizza size={32} /> },
    { name: 'Fashion', desc: 'Trendy clothing and accessories', icon: <TShirt size={32} /> },
    { name: 'Electronics', desc: 'Gadgets and daily tech', icon: <DeviceMobile size={32} /> },
    { name: 'Beauty & Personal Care', desc: 'Grooming and self-care', icon: <Sparkle size={32} /> },
    { name: 'Home & Kitchen', desc: 'Everything for your house', icon: <HouseLine size={32} /> },
    { name: 'Books & Stationery', desc: 'Study and office supplies', icon: <BookOpen size={32} /> },
    { name: 'Sports & Fitness', desc: 'Active lifestyle gear', icon: <Sneaker size={32} /> },
  ];

  const featuredProducts = [
    { name: 'Fresh Fruits Basket', category: 'Groceries', price: '₹299', rating: '4.8', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80' },
    { name: 'Wireless Earbuds', category: 'Electronics', price: '₹1,299', rating: '4.5', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cotton Casual Shirt', category: 'Fashion', price: '₹699', rating: '4.6', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Premium Coffee', category: 'Groceries', price: '₹399', rating: '4.9', img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80' },
    { name: 'Smart Watch', category: 'Electronics', price: '₹1,999', rating: '4.7', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chocolate Cake', category: 'Food', price: '₹549', rating: '4.8', img: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="min-h-screen bg-bg font-sans text-gray-900 selection:bg-primary-light selection:text-primary-dark">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${isScrolled ? 'shadow-md py-3' : 'py-5 border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" onClick={(e) => scrollToSection(e, 'home')} className="flex items-center gap-2 text-primary font-bold text-2xl z-50">
            <img src={logo} alt="NammaKada Logo" className="h-8 w-auto" />
            <span>NammaKada</span>
          </Link>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.id} 
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right: Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-gray-700 font-medium hover:text-primary transition-colors px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md">
              Register
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-700 z-50 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <List size={28} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={`md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} pt-24 px-6 flex flex-col gap-6`}>
          <div className="flex flex-col gap-4 text-xl font-medium text-gray-800">
            {navLinks.map((link) => (
              <a 
                key={link.id} 
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="py-3 border-b border-gray-100 hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-4 mt-8">
            <Link to="/login" className="text-center bg-gray-100 text-gray-800 py-3.5 rounded-xl font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-center bg-primary text-white py-3.5 rounded-xl font-medium shadow-md transition-colors">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* spacer for fixed navbar */}
      <div className="h-20" id="home"></div>

      {/* HERO SECTION */}
      <section className="px-6 lg:px-8 py-12 md:py-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-h-[calc(100vh-80px)] md:min-h-0">
        <div className="flex-1 space-y-6 lg:pr-10 text-center md:text-left mt-10 md:mt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary-dark font-medium text-sm mb-2 shadow-sm border border-green-200">
            <MapPin size={18} weight="fill" />
            <span>Your Local Marketplace</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Shop Local.<br />
            <span className="text-primary">Live Better.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Discover products from trusted local sellers and get what you need, right at your doorstep. Support your community today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center md:justify-start">
            <Link to="/login" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-lg shadow-md">
              Start Shopping <ArrowRight weight="bold" />
            </Link>
            <a href="#categories" onClick={(e) => scrollToSection(e, 'categories')} className="bg-white text-gray-800 border border-gray-200 hover:border-primary hover:text-primary px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center transition-all hover:bg-gray-50">
              Explore Categories
            </a>
          </div>
          <div className="pt-6 flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-1.5"><ShieldCheck size={18} className="text-primary"/> Trusted local sellers</div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5"><Truck size={18} className="text-primary"/> Fast delivery</div>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-md md:max-w-none mx-auto">
          {/* Decorative background blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-light rounded-full blur-[80px] opacity-60 -z-10"></div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
              alt="Local Grocery Shopping" 
              className="rounded-3xl shadow-2xl relative z-10 border-4 border-white object-cover aspect-square md:aspect-[4/3] w-full"
            />
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-gray-100 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="bg-green-100 p-2 rounded-full text-primary"><Truck size={24} weight="fill"/></div>
              <div className="font-bold text-gray-800 text-sm">Fast Delivery</div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-gray-100 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
              <div className="bg-blue-100 p-2 rounded-full text-blue-600"><ShieldCheck size={24} weight="fill"/></div>
              <div className="font-bold text-gray-800 text-sm">Trusted Sellers</div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SCROLL INDICATOR */}
      <div className="flex justify-center pb-12 pt-4 opacity-70 hover:opacity-100 transition-opacity hidden md:flex">
        <a href="#categories" onClick={(e) => scrollToSection(e, 'categories')} className="flex flex-col items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors cursor-pointer">
          <span className="mb-2">Explore NammaKada</span>
          <ArrowRight size={20} className="rotate-90 animate-pulse" />
        </a>
      </div>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Everything you need, from sellers you can trust.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                onClick={(e) => scrollToSection(e, 'featured')}
                className="group cursor-pointer bg-bg hover:bg-white p-6 rounded-3xl border border-gray-100 hover:border-primary-light hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center"
              >
                <div className="bg-white group-hover:bg-primary-light w-16 h-16 rounded-2xl flex items-center justify-center text-gray-700 group-hover:text-primary mb-5 shadow-sm transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NAMMAKADA SECTION */}
      <section id="about" className="py-24 bg-bg scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why NammaKada?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built to make local shopping easier and more reliable.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary-light w-14 h-14 rounded-full flex items-center justify-center text-primary mb-6">
                <Storefront size={28} weight="fill" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Shop Local</h3>
              <p className="text-gray-600 leading-relaxed">Discover products from trusted businesses right in your own area.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary-light w-14 h-14 rounded-full flex items-center justify-center text-primary mb-6">
                <Truck size={28} weight="fill" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Get your orders delivered quickly and securely to your doorstep.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary-light w-14 h-14 rounded-full flex items-center justify-center text-primary mb-6">
                <ShieldCheck size={28} weight="fill" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted Sellers</h3>
              <p className="text-gray-600 leading-relaxed">Shop confidently from verified local sellers with quality guarantees.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary-light w-14 h-14 rounded-full flex items-center justify-center text-primary mb-6">
                <ShoppingCart size={28} weight="fill" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Ordering</h3>
              <p className="text-gray-600 leading-relaxed">Browse, order and track everything seamlessly in one simple place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-white scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How NammaKada Works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Shopping locally is just three simple steps.</p>
          </div>
          
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-green-100 via-primary to-green-100 z-0"></div>
            
            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary-light text-primary font-black text-3xl mb-6">
                  01
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Discover</h3>
                <p className="text-gray-600 max-w-xs">Find products and local sellers near you effortlessly.</p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-primary-light text-white font-black text-3xl mb-6 transform md:scale-110">
                  02
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Order</h3>
                <p className="text-gray-600 max-w-xs">Choose your products, add to cart, and place your order securely.</p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary-light text-primary font-black text-3xl mb-6">
                  03
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Receive</h3>
                <p className="text-gray-600 max-w-xs">Get your order delivered fresh and fast to your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="featured" className="py-24 bg-bg scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Popular Near You</h2>
              <p className="text-gray-500 text-lg">Discover what shoppers are loving right now.</p>
            </div>
            <a href="#categories" onClick={(e) => scrollToSection(e, 'categories')} className="text-primary font-semibold hover:text-primary-dark flex items-center gap-2 group cursor-pointer">
              View All <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredProducts.map((prod, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    ⭐ {prod.rating}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1">{prod.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1">{prod.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-extrabold text-gray-900">{prod.price}</span>
                    <button 
                      onClick={() => alert("Cart functionality coming soon!")}
                      className="bg-bg hover:bg-primary hover:text-white text-gray-800 p-2.5 rounded-xl transition-colors border border-gray-100"
                    >
                      <ShoppingCart size={20} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL SELLER / COMMUNITY */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-green-900 rounded-[2.5rem] overflow-hidden relative flex flex-col md:flex-row shadow-2xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)]" style={{backgroundSize: '32px 32px'}}></div>
            
            <div className="flex-1 p-10 md:p-16 lg:p-20 relative z-10 flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Your Neighborhood, <br/>Now Online.
              </h2>
              <p className="text-green-100 text-lg md:text-xl mb-12 max-w-md">
                Support local businesses while enjoying the convenience of modern online shopping.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">500+</div>
                  <div className="text-green-200 text-sm font-medium">Local Products</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">100+</div>
                  <div className="text-green-200 text-sm font-medium">Trusted Sellers</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">Fast</div>
                  <div className="text-green-200 text-sm font-medium">Local Delivery</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative min-h-[300px] hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80" 
                alt="Local Storefront" 
                className="absolute inset-0 w-full h-full object-cover rounded-l-[4rem] border-8 border-green-900 shadow-[-20px_0_40px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta" className="py-24 bg-primary-light scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Ready to Shop Local?</h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Discover great products from businesses around you. Join NammaKada today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              Start Shopping
            </Link>
            <Link to="/register" className="bg-white hover:bg-gray-50 text-primary-dark border-2 border-primary/20 hover:border-primary px-10 py-4 rounded-full font-bold text-lg shadow-sm hover:shadow-md transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            
            {/* Brand Col */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-2xl mb-4">
                <img src={logo} alt="NammaKada Logo" className="h-8 w-auto brightness-0 invert" />
                <span>NammaKada</span>
              </div>
              <p className="text-gray-300 font-medium mb-4">Shop Local. Live Better.</p>
              <p className="text-sm max-w-xs leading-relaxed">
                Your local marketplace for convenient, trusted shopping while supporting neighborhood businesses.
              </p>
            </div>
            
            {/* Links Col 1 */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Explore</h4>
              <ul className="space-y-4">
                <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-white transition-colors cursor-pointer">Home</a></li>
                <li><a href="#categories" onClick={(e) => scrollToSection(e, 'categories')} className="hover:text-white transition-colors cursor-pointer">Categories</a></li>
                <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-white transition-colors cursor-pointer">How It Works</a></li>
              </ul>
            </div>
            
            {/* Links Col 2 */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Account</h4>
              <ul className="space-y-4">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Links Col 3 */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} NammaKada. All rights reserved.</p>
            <p className="flex items-center gap-1">Built with <span className="text-red-500">❤️</span> for local commerce</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
