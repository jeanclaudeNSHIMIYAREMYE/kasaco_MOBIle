// src/pages/PourquoiKasaco.jsx
import { useEffect, useRef, useState } from "react";
import Navigation from "../components/Navigation";

// Import des images depuis le dossier assets
import heroImage from "../assets/images/hero-car.jpg";
import testimonial1 from "../assets/images/testimonial-1.jpg";
import testimonial2 from "../assets/images/testimonial-2.jpg";
import garageImage from "../assets/images/garage.jpg";
import onlineSaleImage from "../assets/images/online-sale.jpg";
import localSaleImage from "../assets/images/local-sale.jpg";

export default function PourquoiKasaco() {
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.dataset.id]: true }));
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px" }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const features = [
    {
      id: 1,
      icon: "bi bi-building",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      title: "Vente et importation des véhicules locales",
      description:
        "Nous proposons un large choix de véhicules locaux de qualité soigneusement inspectés et certifiés.",
      image: localSaleImage,
      delay: 0,
    },
    {
      id: 2,
      icon: "bi bi-globe2",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      title: "Vente et importation des véhicules en ligne",
      description:
        "Achetez facilement votre véhicule en ligne avec livraison rapide et sécurisée partout au Burundi.",
      image: onlineSaleImage,
      delay: 200,
    },
    {
      id: 3,
      icon: "bi bi-car-front-fill",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      title: "Garage",
      description:
        "Nos garages sont équipés pour l'entretien, la réparation et le service après-vente de votre véhicule.",
      image: garageImage,
      delay: 400,
    },
  ];

  const stats = [
    { id: 1, value: "500+", label: "Véhicules vendus", icon: "bi bi-trophy" },
    { id: 2, value: "98%", label: "Clients satisfaits", icon: "bi bi-emoji-smile" },
    { id: 3, value: "10+", label: "Années d'expérience", icon: "bi bi-calendar-check" },
    { id: 4, value: "24/7", label: "Support client", icon: "bi bi-headset" },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Jean Claude",
      initials: "JD",
      image: testimonial1,
      rating: 5,
      text: "Excellent service ! J'ai trouvé la voiture de mes rêves en quelques jours. Je recommande vivement KASACO.",
    },
    {
      id: 2,
      name: "Dismas Karinzi.",
      initials: "MK",
      image: testimonial2,
      rating: 5,
      text: "Équipe professionnelle et à l'écoute. La livraison a été rapide et le véhicule était en parfait état.",
    },
  ];

  return (
    <Navigation>
      {/* Hero Section avec image importée */}
      <div className="relative h-[400px] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10"></div>
          <img
            src={heroImage}
            alt="Voitures de luxe KASACO"
            className="w-full h-full object-cover animate-slow-zoom"
            onError={(e) => {
              console.error("Erreur chargement image:", e);
              e.target.src = "https://images.unsplash.com/photo-1492144533655-aae69c8f7b24?w=1200&h=400&fit=crop";
            }}
          />
        </div>
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
            Pourquoi <span className="text-red-500">KASACO</span> ?
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl animate-fade-in-up animation-delay-200">
            Votre partenaire de confiance pour l'automobile au Burundi
          </p>
          <div className="w-24 h-1 bg-red-500 mt-8 animate-width-in"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Section des fonctionnalités avec images */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => (sectionRefs.current[index] = el)}
              data-id={feature.id}
              className={`transform transition-all duration-700 ${
                isVisible[feature.id]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Image de fond subtile */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <img
                    src={feature.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Effet de bordure animée */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Décoration supérieure */}
                <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                
                <div className="p-8">
                  {/* Icône avec animation */}
                  <div className={`relative mb-6 inline-block`}>
                    <div className={`absolute inset-0 ${feature.bgColor} rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`relative w-20 h-20 mx-auto ${feature.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <i className={`${feature.icon} text-4xl ${feature.textColor}`}></i>
                    </div>
                  </div>

                  {/* Titre */}
                  <h3 className={`text-xl font-bold mb-4 ${feature.textColor} group-hover:scale-105 transition-transform duration-300`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Lien "En savoir plus" */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="#" className={`inline-flex items-center ${feature.textColor} hover:underline`}>
                      En savoir plus
                      <i className="bi bi-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section des statistiques */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            KASACO en <span className="text-red-500">chiffres</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.id}
                className="text-center transform hover:scale-110 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
                  <div className="relative w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <i className={`${stat.icon} text-3xl text-red-500`}></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2 animate-pulse-slow">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section témoignages avec images */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold mb-4">Ce qu'ils disent de nous</h2>
          <p className="text-gray-600 mb-12">Découvrez les avis de nos clients satisfaits</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition group">
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-indigo-500 rounded-full blur-md opacity-50"></div>
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="relative w-12 h-12 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          // Fallback avec initiales
                          const parent = e.target.parentElement;
                          const fallback = document.createElement('div');
                          fallback.className = "relative w-12 h-12 bg-gradient-to-r from-red-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl";
                          fallback.textContent = testimonial.initials;
                          parent.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div className="relative w-12 h-12 bg-gradient-to-r from-red-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {testimonial.initials}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-sm"></i>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-left italic">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section CTA */}
        <div className="relative bg-gradient-to-r from-red-600 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
          
          <div className="relative p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4 animate-pulse-slow">
              Prêt à trouver votre prochaine voiture ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des milliers de clients satisfaits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="px-8 py-4 bg-white text-red-600 rounded-full font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <i className="bi bi-search mr-2"></i>
                Découvrir nos véhicules
              </a>
              <a
                href="/contact"
                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-red-600 hover:scale-105 transition-all duration-300"
              >
                <i className="bi bi-envelope mr-2"></i>
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Styles personnalisés */}
      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite ease-in-out;
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        @keyframes width-in {
          0% { width: 0; opacity: 0; }
          100% { width: 96px; opacity: 1; }
        }
        .animate-width-in {
          animation: width-in 1s ease-out forwards;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </Navigation>
  );
}